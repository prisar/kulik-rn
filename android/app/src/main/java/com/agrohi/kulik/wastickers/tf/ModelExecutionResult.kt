package com.agrohi.kulik.wastickers.tf

import android.graphics.Bitmap

data class ModelExecutionResult(
        val bitmapResult: Bitmap,
        val bitmapOriginal: Bitmap,
        val bitmapMaskOnly: Bitmap,
        val executionLog: String,
        // A map between labels and colors of the items found.
        val itemsFound: Map<String, Int>
)
