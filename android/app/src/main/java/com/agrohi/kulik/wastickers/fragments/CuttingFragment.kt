//package com.agrohi.kulik.wastickers.fragments
//
//
//import android.content.Context
//import android.graphics.Bitmap
//import android.graphics.BitmapFactory
//import android.graphics.BitmapRegionDecoder
//import android.graphics.Rect
//import androidx.fragment.app.Fragment
//import androidx.fragment.app.FragmentActivity
//import com.agrohi.kulik.R
//import com.agrohi.kulik.wastickers.tf.SegmentationProcessor
//import com.agrohi.kulik.wastickers.tf.SegmentationProcessor.SegmentationResult
//import com.google.android.gms.tasks.Continuation
//import com.google.android.gms.tasks.OnSuccessListener
//import com.google.android.gms.tasks.Task
//import kotlin.jvm.internal.Intrinsics
//
//
//public final class CuttingFragment: Fragment(R.layout.fragment_cutting) {
//
//
//    fun cutoutMagically() {
//        val activity: FragmentActivity? = activity
//        if (activity != null) {
////            (activity as StickerEditorActivity).showLoading(C3804R.string.loading_image)
//            val newInstance: BitmapRegionDecoder = BitmapRegionDecoder.newInstance(getWorkingFile().getPath(), false)
//            if (newInstance == null) {
//                Intrinsics.throwNpe()
//            }
//            val decodeRegion: Bitmap = newInstance.decodeRegion(Rect(0, 0, newInstance.getWidth(), newInstance.getHeight()), BitmapFactory.Options())
//            val context: Context? = context
//            if (context == null) {
//                Intrinsics.throwNpe()
//            }
//            Intrinsics.checkExpressionValueIsNotNull(context, "context!!")
//            val segmentationProcessor = SegmentationProcessor(context!!)
////            segmentationProcessor.initialize().continueWithTask((segmentationProcessor, decodeRegion)).addOnSuccessListener((this)).addOnFailureListener((this))
//            return
//        }
//        throw TypeCastException("null cannot be cast to non-null type com.marsvard.stickermakerforwhatsapp.editor2.StickerEditorActivity")
//    }
//
//    abstract class cutoutMagically<TResult, TContinuationResult>(/* synthetic */val `$processor`: SegmentationProcessor, /* synthetic */val `$bmp`: Bitmap) : Continuation<TResult, Task<TContinuationResult>?> {
//        fun then(task: Task<Void?>?): Task<SegmentationResult> {
//            Intrinsics.checkParameterIsNotNull(task, "it")
//            val segmentationProcessor = `$processor`
//            val bitmap = `$bmp`
//            Intrinsics.checkExpressionValueIsNotNull(bitmap, "bmp")
//            return segmentationProcessor.runSegmentationAsync(bitmap)
//        }
//
//    }
//
//}
