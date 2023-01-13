package com.agrohi.kulik.wastickers.interfaces;

import java.io.File;

public interface OnImageDownloadTaskCompletion {
    public void onFinish(String filePath, File saveImgFolder);
}
