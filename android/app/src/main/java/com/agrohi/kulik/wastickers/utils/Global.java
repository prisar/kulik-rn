package com.agrohi.kulik.wastickers.utils;

import android.graphics.Bitmap;

public class Global {

    public static int filterId = -1;

    Bitmap image;
    public static int position = 0;
    public static int color = 0xFFFF0000;

    public Bitmap getImage() {
        return image;
    }

    public void setImage(Bitmap image) {
        this.image = image;
    }

    public static int getColor() {
        return color;
    }

    public void setColor(int color) {
        this.color = color;
    }

    public int getPosition() {
        return position;
    }

    public void setPosition(int position) {
        this.position = position;
    }

}
