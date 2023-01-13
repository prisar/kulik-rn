//package com.agrohi.kulik.wastickers.tf
//
//import android.content.Context
//import android.content.res.AssetManager
//import android.graphics.*
//import android.util.Log
//import androidx.core.view.ViewCompat
//import androidx.lifecycle.LifecycleObserver
//import com.google.android.gms.tasks.Task
//import com.google.android.gms.tasks.Tasks
////import com.jiangpeng.android.antrace.Objects.curve
////import com.jiangpeng.android.antrace.Objects.dpoint
////import com.jiangpeng.android.antrace.Objects.path
////import com.jiangpeng.android.antrace.Utils
//import org.tensorflow.lite.Interpreter
//import org.tensorflow.lite.gpu.GpuDelegate
//import java.io.FileInputStream
//import java.io.IOException
//import java.nio.ByteBuffer
//import java.nio.ByteOrder
//import java.nio.channels.FileChannel
//import java.util.concurrent.Callable
//import java.util.concurrent.ExecutorService
//import java.util.concurrent.Executors
//import kotlin.jvm.internal.Intrinsics
//
//class SegmentationProcessor(context2: Context) : LifecycleObserver, Callable<Void> {
//    private val context: Context
//    private val executorService: ExecutorService
//    private val gpuDelegate: GpuDelegate? = null
//    private var inputImageHeight = 0
//    private var inputImageWidth = 0
//    private var interpreter: Interpreter? = null
//    private var modelInputSize = 0
//    fun initialize(): Task<Void> {
//        val call = Tasks.call<Void>(executorService, this)
//        Intrinsics.checkExpressionValueIsNotNull(call, "Tasks.call(executorServi…          null\n        })")
//        return call
//    }
//
//    /* access modifiers changed from: private */
//    @Throws(IOException::class)
//    fun initializeInterpreter() {
//        val assets = context.assets
//        Intrinsics.checkExpressionValueIsNotNull(assets, "assetManager")
//        val loadModelFile = loadModelFile(assets)
//        val options = Interpreter.Options()
//        options.setNumThreads(2)
//        val interpreter2 = Interpreter(loadModelFile, options)
//        val shape = interpreter2.getInputTensor(0).shape()
//        val i = shape[1]
//        inputImageWidth = i
//        val i2 = shape[2]
//        inputImageHeight = i2
//        modelInputSize = i * 4 * i2 * 3
//        interpreter = interpreter2
//    }
//
//    @Throws(IOException::class)
//    private fun loadModelFile(assetManager: AssetManager): ByteBuffer {
//        val openFd = assetManager.openFd(SegmentationProcessor.Companion.MODEL_FILE)
//        Intrinsics.checkExpressionValueIsNotNull(openFd, "assetManager.openFd(Segm…tionProcessor.MODEL_FILE)")
//        val map = FileInputStream(openFd.fileDescriptor).channel.map(FileChannel.MapMode.READ_ONLY, openFd.startOffset, openFd.declaredLength)
//        Intrinsics.checkExpressionValueIsNotNull(map, "fileChannel.map(FileChan…rtOffset, declaredLength)")
//        return map
//    }
//
//    // utils
//    fun scale(bitmap: Bitmap, i: Int, i2: Int, z: Boolean): Bitmap {
//        val i3: Int
//        val i4: Int
//        Intrinsics.checkParameterIsNotNull(bitmap, "bitmap")
//        val f = i.toFloat()
//        val f2 = i2.toFloat()
//        if (bitmap.width.toFloat() / f >= bitmap.height.toFloat() / f2) {
//            i3 = (f / bitmap.width.toFloat() * bitmap.height.toFloat()).toInt()
//            i4 = i
//        } else {
//            i4 = (f2 / bitmap.height.toFloat() * bitmap.width.toFloat()).toInt()
//            i3 = i2
//        }
//        val createBitmap = Bitmap.createBitmap(i, i2, Bitmap.Config.ARGB_8888)
//        val width = i4.toFloat() / bitmap.width.toFloat()
//        val height = i3.toFloat() / bitmap.height.toFloat()
//        val f3 = f / 2.0f
//        val f4 = f2 / 2.0f
//        val matrix = Matrix()
//        matrix.setScale(width, height, f3, f4)
//        val canvas = Canvas(createBitmap)
//        canvas.setMatrix(matrix)
//        canvas.drawBitmap(bitmap, f3 - (bitmap.width / 2).toFloat(), f4 - (bitmap.height / 2).toFloat(), Paint(2))
//        if (z) {
//            bitmap.recycle()
//        }
//        Intrinsics.checkExpressionValueIsNotNull(createBitmap, "scaledBitmap")
//        return createBitmap
//    }
//
//    fun runSegmentation(bitmap: Bitmap): SegmentationResult {
//        Intrinsics.checkParameterIsNotNull(bitmap, "bitmap")
//        val nanoTime = System.nanoTime()
//        var i = 0
//        val scale: Bitmap = scale(bitmap, inputImageWidth, inputImageHeight, false)
//        val convertBitmapToByteBuffer = convertBitmapToByteBuffer(scale)
//        val nanoTime2 = System.nanoTime() - nanoTime
//        val j = 1000000.toLong()
//        Log.d(SegmentationProcessor.Companion.TAG, "Preprocessing time = " + nanoTime2 / j + "ms")
//        val nanoTime3 = System.nanoTime()
//        val jArr: Array<Array<LongArray?>?> = arrayOfNulls(1)
//        var i2 = 0
//        var i3 = 1
//        while (i2 < i3) {
//            val i4 = inputImageWidth
//            val jArr2 = arrayOfNulls<LongArray>(i4)
//            while (i < i4) {
//                jArr2[i] = LongArray(inputImageWidth)
//                i++
//            }
//            jArr[i2] = jArr2
//            i2++
//            i = 0
//            i3 = 1
//        }
//        val interpreter2 = interpreter
//        interpreter2?.run(convertBitmapToByteBuffer, jArr)
//        Log.d(SegmentationProcessor.Companion.TAG, "Inference time = " + (System.nanoTime() - nanoTime3) / j + "ms")
//        val nanoTime4 = System.nanoTime()
//        val i5 = inputImageWidth
//        val iArr = arrayOfNulls<IntArray>(i5)
//        for (i6 in 0 until i5) {
//            iArr[i6] = IntArray(inputImageHeight)
//        }
//        convertModelOutputToSegmentationResult(jArr, iArr)
//        Log.d(SegmentationProcessor.Companion.TAG, "Postprocessing time = " + (System.nanoTime() - nanoTime4) / j + "ms")
//        val nanoTime5 = System.nanoTime()
//        val createOverlayResult = createOverlayResult(bitmap, scale, iArr)
//        val nanoTime6 = (System.nanoTime() - nanoTime5) / j
//        Log.d(SegmentationProcessor.Companion.TAG, "Optional: Result visualization = " + nanoTime6 + "ms")
//        return SegmentationResult(this, createOverlayResult)
//    }
//
////    fun runSegmentationAsync(bitmap: Bitmap?): Task<SegmentationResult> {
////        Intrinsics.checkParameterIsNotNull(bitmap, "bitmap")
////        val call: Task<SegmentationResult> = Tasks.call(executorService, (this, bitmap))
////        Intrinsics.checkExpressionValueIsNotNull(call, "Tasks.call(executorServi…unSegmentation(bitmap) })")
////        return call
////    }
//
//    fun close() {
//        val gpuDelegate2 = gpuDelegate
//        gpuDelegate2?.close()
//        val interpreter2 = interpreter
//        interpreter2?.close()
//    }
//
//    private fun convertBitmapToByteBuffer(bitmap: Bitmap): ByteBuffer {
//        val allocateDirect = ByteBuffer.allocateDirect(modelInputSize)
//        allocateDirect.order(ByteOrder.nativeOrder())
//        val i = inputImageWidth * inputImageHeight
//        val iArr = IntArray(i)
//        bitmap.getPixels(iArr, 0, bitmap.width, 0, 0, bitmap.width, bitmap.height)
//        for (i2 in 0 until i) {
//            val i3 = iArr[i2]
//            allocateDirect.putFloat((i3 shr 16 and 255).toFloat() / SegmentationProcessor.Companion.IMAGE_MEAN - 1.0f)
//            allocateDirect.putFloat((i3 shr 8 and 255).toFloat() / SegmentationProcessor.Companion.IMAGE_MEAN - 1.0f)
//            allocateDirect.putFloat((i3 and 255).toFloat() / SegmentationProcessor.Companion.IMAGE_MEAN - 1.0f)
//        }
//        Intrinsics.checkExpressionValueIsNotNull(allocateDirect, "byteBuffer")
//        return allocateDirect
//    }
//
//    private fun convertModelOutputToSegmentationResult(jArr: Array<Array<LongArray?>?>, iArr: Array<IntArray?>) {
//        val length = (jArr[0] as Array<Any?>).size
//        val length2: Int = jArr[0]?.get(0)?.size ?: 0
//        val jArr2 = jArr[0]
//        for (i in 0 until length) {
//            for (i2 in 0 until length2) {
//                iArr[i]!![i2] = jArr2?.get(i)!![i2].toInt()
//            }
//        }
//    }
//
//    private fun createOverlayResult(bitmap: Bitmap, bitmap2: Bitmap, iArr: Array<IntArray?>): Path {
//        val width = bitmap2.width
//        val height = bitmap2.height
//        if (width == iArr[0]!!.size && height == (iArr as Array<Any?>).size) {
//            val createBitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
//            for (i in 0 until height) {
//                for (i2 in 0 until width) {
////                    if (SegmentationProcessor.Companion.clear_label_list.get(iArr[i2]!![i]).toBoolean()) {
////                        createBitmap.setPixel(i, i2, ViewCompat.MEASURED_STATE_MASK)
////                    } else {
////                        createBitmap.setPixel(i, i2, -1)
////                    }
//                }
//            }
//            val companion: Companion = SegmentationProcessor.Companion.Companion
//            Intrinsics.checkExpressionValueIsNotNull(createBitmap, "segBitmap")
//            return companion.getSegmentationPath(bitmap, createBitmap)
//        }
//        throw IllegalArgumentException("Input image size and segmentation array size does not match " + '(' + width + ',' + height + ") != (" + iArr[0].length + ',' + (iArr as Array<Any?>).size + ')')
//    }
//
//    public final class SegmentationResult(segmentationProcessor: SegmentationProcessor, path: Path) {
//        val overlayPath: Path
//        /* synthetic */ val `this$0`: SegmentationProcessor
//
//        init {
//            Intrinsics.checkParameterIsNotNull(path, "overlayPath")
//            `this$0` = segmentationProcessor
//            overlayPath = path
//        }
//    }
//
//    class Companion private constructor() {
//        /* synthetic */   constructor(defaultConstructorMarker: DefaultConstructorMarker?) : this() {}
//
//        /* access modifiers changed from: private */
//        fun getSegmentationPath(bitmap: Bitmap, bitmap2: Bitmap): Path {
////            val traceImage: path = Utils.traceImage(bitmap2)
////            val path = Path()
////            val dpointArr: Array<Array<dpoint>?> = traceImage.curve.f5217c
////            Intrinsics.checkExpressionValueIsNotNull(dpointArr, "path.curve.c")
////            val dpointArr2: Array<dpoint> = last(dpointArr as Array<Any?> as Array<T?>) as Array<dpoint>
////            path.moveTo(dpointArr2[2].f5219x as Float, dpointArr2[2].f5220y as Float)
////            val i: Int = traceImage.curve.f5218n - 1
////            if (i >= 0) {
////                var i2 = 0
////                while (true) {
////                    val dpointArr3: Array<dpoint> = traceImage.curve.f5217c.get(i2)
////                    val curve: curve = traceImage.curve
////                    if (curve.tag.get(i2) === curve.POTRACE_CURVETO) {
////                        val dpoint: dpoint = dpointArr3[0]
////                        val dpoint2: dpoint = dpointArr3[1]
////                        val dpoint3: dpoint = dpointArr3[2]
////                        path.cubicTo(dpoint.f5219x as Float, dpoint.f5220y as Float, dpoint2.f5219x as Float, dpoint2.f5220y as Float, dpoint3.f5219x as Float, dpoint3.f5220y as Float)
////                    } else if (curve.tag.get(i2) === curve.POTRACE_CORNER) {
////                        val dpoint4: dpoint = dpointArr3[1]
////                        val dpoint5: dpoint = dpointArr3[2]
////                        path.lineTo(dpoint4.f5219x as Float, dpoint4.f5220y as Float)
////                        path.lineTo(dpoint5.f5219x as Float, dpoint5.f5220y as Float)
////                    }
////                    if (i2 == i) {
////                        break
////                    }
////                    i2++
////                }
////            }
////            path.close()
////            val matrix = Matrix()
////            val max = Math.max(bitmap.height.toFloat() / bitmap2.height.toFloat(), bitmap.width.toFloat() / bitmap2.width.toFloat())
////            matrix.postScale(max, max)
////            if (bitmap.height < bitmap.width) {
////                matrix.postTranslate(0.0f, -(bitmap2.height.toFloat() * max - bitmap.height.toFloat()) / 2.toFloat())
////            }
////            if (bitmap.height > bitmap.width) {
////                matrix.postTranslate(-(bitmap2.width.toFloat() * max - bitmap.width.toFloat()) / 2.toFloat(), 0.0f)
////            }
////            matrix.postScale(1.0f, -1.0f, bitmap.width.toFloat() / 2.0f, bitmap.height.toFloat() / 2.0f)
////            path.transform(matrix)
////            return path
//            return path()
//        }
//    }
//
//    companion object {
//        val Companion = SegmentationProcessor.Companion {
//            null
//        }
//
//        private const val FLOAT_TYPE_SIZE = 4
//        private const val IMAGE_MEAN = 128.0f
//        private const val IMAGE_OFFSET = 1.0f
//        private const val MODEL_FILE = "deeplabv3_mnv2_pascal_trainval.tflite"
//        private const val OUTPUT_CLASSES_COUNT = 0
//        private const val PIXEL_SIZE = 3
//        private const val TAG = "SegmentationProcessor"
//        private val clear_label_list: Array<Boolean> = arrayOf(true, true, true, true, true, true, true, false, false, true, false, true, false, false, false, false, false, true, true, true, true)
//
////        init {
////            val boolArr = arrayOf(true, true, true, true, true, true, true, false, false, true, false, true, false, false, false, false, false, true, true, true, true)
////            SegmentationProcessor.Companion.clear_label_list = boolArr
////            SegmentationProcessor.Companion.OUTPUT_CLASSES_COUNT = boolArr.size
////        }
//    }
//
//    init {
//        Intrinsics.checkParameterIsNotNull(context2, "context")
//        context = context2
//        val newCachedThreadPool = Executors.newCachedThreadPool()
//        Intrinsics.checkExpressionValueIsNotNull(newCachedThreadPool, "Executors.newCachedThreadPool()")
//        executorService = newCachedThreadPool
//        System.loadLibrary("antrace")
//    }
//
//    override fun call(): Void {
//        TODO("Not yet implemented")
//    }
//}
