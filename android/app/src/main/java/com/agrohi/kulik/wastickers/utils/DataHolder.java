package com.agrohi.kulik.wastickers.utils;

public enum DataHolder {

    INSTANCE;

    byte[] bmpObj;

    public static boolean hasData() {
        return INSTANCE.bmpObj != null;
    }

    public static void setData(byte[] bmpObj) {
        INSTANCE.bmpObj = null;
        INSTANCE.bmpObj = bmpObj;
    }

    public static byte[] getData() {
        return INSTANCE.bmpObj;
    }
}
