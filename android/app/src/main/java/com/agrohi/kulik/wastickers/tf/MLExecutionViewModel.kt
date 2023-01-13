package com.agrohi.kulik.wastickers.tf

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import android.util.Log
import com.agrohi.kulik.wastickers.utils.ImageUtils
import java.io.File
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.ExecutorCoroutineDispatcher
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch

private const val TAG = "MLExecutionViewModel"

class MLExecutionViewModel : ViewModel() {

    private val _resultingBitmap = MutableLiveData<ModelExecutionResult>()

    val resultingBitmap: LiveData<ModelExecutionResult>
        get() = _resultingBitmap

    private val viewModelJob = Job()
    private val viewModelScope = CoroutineScope(viewModelJob)

    // the execution of the model has to be on the same thread where the interpreter
    // was created
    fun onApplyModel(
            filePath: String,
            imageSegmentationModel: ImageSegmentationModelExecutor?,
            inferenceThread: ExecutorCoroutineDispatcher
    ) {
        viewModelScope.launch(inferenceThread) {
            val contentImage =
                    ImageUtils.decodeBitmap(
                            File(filePath)
                    )
            try {
                val result = imageSegmentationModel?.execute(contentImage)
                _resultingBitmap.postValue(result)
            } catch (e: Exception) {
                Log.e(TAG, "Fail to execute ImageSegmentationModelExecutor: ${e.message}")
                _resultingBitmap.postValue(null)
            }
        }
    }
}
