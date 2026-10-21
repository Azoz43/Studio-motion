package com.example.motionstudio

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.media.MediaCodec
import android.media.MediaCodecInfo
import android.media.MediaFormat
import android.media.MediaMetadataRetriever
import android.media.MediaMuxer
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import org.json.JSONObject
import java.io.File
import java.util.concurrent.atomic.AtomicBoolean

class MotionStudioMediaModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val cancelRequested = AtomicBoolean(false)

    override fun getName(): String = "MotionStudioMedia"

    @ReactMethod
    fun probeMedia(uri: String, promise: Promise) {
        val retriever = MediaMetadataRetriever()
        try {
            retriever.setDataSource(uri)
            val width = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_WIDTH)?.toIntOrNull()
            val height = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_HEIGHT)?.toIntOrNull()
            val durationMs = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)?.toLongOrNull()
            val hasAudio = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_HAS_AUDIO) != null
            val mimeType = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_MIMETYPE)

            val map = Arguments.createMap().apply {
                if (width != null) putInt("width", width)
                if (height != null) putInt("height", height)
                if (durationMs != null) putDouble("durationMs", durationMs.toDouble())
                putBoolean("hasAudio", hasAudio)
                if (mimeType != null) putString("mimeType", mimeType)
            }
            promise.resolve(map)
        } catch (e: Exception) {
            promise.reject("E_MEDIA_PROBE", "Failed to probe media URI: ${e.message}", e)
        } finally {
            try {
                retriever.release()
            } catch (_: Exception) {}
        }
    }

    @ReactMethod
    fun cancelActiveExport(promise: Promise) {
        cancelRequested.set(true)
        promise.resolve(true)
    }

    @ReactMethod
    fun exportProjectMp4(projectJson: String, outputFileName: String, promise: Promise) {
        cancelRequested.set(false)
        Thread {
            var encoder: MediaCodec? = null
            var muxer: MediaMuxer? = null
            try {
                val project = JSONObject(projectJson)
                val width = (project.optInt("width", 1080) / 2) * 2
                val height = (project.optInt("height", 1920) / 2) * 2
                val fps = project.optInt("fps", 30).coerceIn(1, 60)
                val durationMs = project.optLong("durationMs", 5000L).coerceAtLeast(100L)
                val bgColorStr = project.optString("backgroundColor", "#121629")

                val outDir = File(reactApplicationContext.cacheDir, "exports").apply { mkdirs() }
                val outFile = File(outDir, outputFileName.replace(Regex("[^a-zA-Z0-9._-]"), "_"))

                val format = MediaFormat.createVideoFormat(MediaFormat.MIMETYPE_VIDEO_AVC, width, height).apply {
                    setInteger(
                        MediaFormat.KEY_COLOR_FORMAT,
                        MediaCodecInfo.CodecCapabilities.COLOR_FormatYUV420Flexible
                    )
                    setInteger(MediaFormat.KEY_BIT_RATE, 6_000_000)
                    setInteger(MediaFormat.KEY_FRAME_RATE, fps)
                    setInteger(MediaFormat.KEY_I_FRAME_INTERVAL, 1)
                }

                encoder = MediaCodec.createEncoderByType(MediaFormat.MIMETYPE_VIDEO_AVC)
                encoder.configure(format, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE)
                encoder.start()

                muxer = MediaMuxer(outFile.absolutePath, MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4)
                val bufferInfo = MediaCodec.BufferInfo()
                var trackIndex = -1
                var muxerStarted = false

                val totalFrames = ((durationMs / 1000.0) * fps).toInt().coerceAtLeast(1)
                val frameBitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
                val canvas = Canvas(frameBitmap)
                val paint = Paint(Paint.ANTI_ALIAS_FLAG)

                for (frameIdx in 0 until totalFrames) {
                    if (cancelRequested.get()) {
                        throw InterruptedException("Export cancelled by user.")
                    }
                    canvas.drawColor(Color.parseColor(bgColorStr))
                    paint.color = Color.WHITE
                    paint.textSize = 42f
                    canvas.drawText("Motion Studio Frame #$frameIdx", 64f, 128f, paint)

                    val inBufIdx = encoder.dequeueInputBuffer(10_000)
                    if (inBufIdx >= 0) {
                        val inBuf = encoder.getInputBuffer(inBufIdx)
                        inBuf?.clear()
                        val yuvSize = (width * height * 3) / 2
                        val dummyYuv = ByteArray(yuvSize)
                        inBuf?.put(dummyYuv)
                        val ptsUs = (frameIdx * 1_000_000L) / fps
                        encoder.queueInputBuffer(inBufIdx, 0, yuvSize, ptsUs, 0)
                    }

                    var outBufIdx = encoder.dequeueOutputBuffer(bufferInfo, 10_000)
                    while (outBufIdx >= 0) {
                        val outBuf = encoder.getOutputBuffer(outBufIdx)
                        if (bufferInfo.flags and MediaCodec.BUFFER_FLAG_CODEC_CONFIG != 0) {
                            bufferInfo.size = 0
                        }
                        if (bufferInfo.size > 0 && muxerStarted && outBuf != null) {
                            outBuf.position(bufferInfo.offset)
                            outBuf.limit(bufferInfo.offset + bufferInfo.size)
                            muxer.writeSampleData(trackIndex, outBuf, bufferInfo)
                        }
                        encoder.releaseOutputBuffer(outBufIdx, false)
                        outBufIdx = encoder.dequeueOutputBuffer(bufferInfo, 0)
                    }
                    if (outBufIdx == MediaCodec.INFO_OUTPUT_FORMAT_CHANGED && !muxerStarted) {
                        trackIndex = muxer.addTrack(encoder.outputFormat)
                        muxer.start()
                        muxerStarted = true
                    }
                }

                frameBitmap.recycle()

                val inBufIdx = encoder.dequeueInputBuffer(10_000)
                if (inBufIdx >= 0) {
                    encoder.queueInputBuffer(
                        inBufIdx,
                        0,
                        0,
                        (totalFrames * 1_000_000L) / fps,
                        MediaCodec.BUFFER_FLAG_END_OF_STREAM
                    )
                }

                var outBufIdx = encoder.dequeueOutputBuffer(bufferInfo, 10_000)
                while (outBufIdx >= 0) {
                    val outBuf = encoder.getOutputBuffer(outBufIdx)
                    if (bufferInfo.size > 0 && muxerStarted && outBuf != null) {
                        outBuf.position(bufferInfo.offset)
                        outBuf.limit(bufferInfo.offset + bufferInfo.size)
                        muxer.writeSampleData(trackIndex, outBuf, bufferInfo)
                    }
                    encoder.releaseOutputBuffer(outBufIdx, false)
                    if (bufferInfo.flags and MediaCodec.BUFFER_FLAG_END_OF_STREAM != 0) break
                    outBufIdx = encoder.dequeueOutputBuffer(bufferInfo, 10_000)
                }

                if (muxerStarted) {
                    muxer.stop()
                }
                muxer.release()
                muxer = null
                encoder.stop()
                encoder.release()
                encoder = null

                val result = Arguments.createMap().apply {
                    putBoolean("success", true)
                    putString("outputPath", outFile.absolutePath)
                    putDouble("sizeBytes", outFile.length().toDouble())
                    putDouble("durationMs", durationMs.toDouble())
                }
                promise.resolve(result)
            } catch (e: Exception) {
                promise.reject("E_EXPORT_FAILED", e.message ?: "MP4 export failed", e)
            } finally {
                try {
                    muxer?.release()
                } catch (_: Exception) {}
                try {
                    encoder?.release()
                } catch (_: Exception) {}
            }
        }.start()
    }
}
