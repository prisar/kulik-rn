package com.agrohi.kulik.wastickers.models;

import android.net.Uri;
import android.os.Parcel;
import android.os.Parcelable;

import androidx.annotation.Keep;

import java.util.List;

@Keep
public class Sticker implements Parcelable {
    private boolean isAnimated;
    public String imageFileName;
    public List<String> emojis;
    String uri = "", size = "";
    Uri uri_local;
    long size_local = 0;

    public Sticker(boolean isAnimated, String imageFileName, List<String> emojis) {
        this.isAnimated = isAnimated;
        this.imageFileName = imageFileName;
        this.emojis = emojis;
    }

    public Sticker(boolean isAnimated, String imageFileName, Uri uri_local, List<String> emojis) {
        this.isAnimated = isAnimated;
        this.imageFileName = imageFileName;
        this.emojis = emojis;
        this.uri_local = uri_local;
    }

    public Sticker(Parcel in) {
        imageFileName = in.readString();
        emojis = in.createStringArrayList();
        size_local = in.readLong();
    }

    public static final Creator<Sticker> CREATOR = new Creator<Sticker>() {
        @Override
        public Sticker createFromParcel(Parcel in) {
            return new Sticker(in);
        }

        @Override
        public Sticker[] newArray(int size) {
            return new Sticker[size];
        }
    };

    public Sticker() {
    }

    public void setSizeAsLong(long size) {
        this.size_local = size;
    }

    @Override
    public int describeContents() {
        return 0;
    }

    @Override
    public void writeToParcel(Parcel dest, int flags) {
        dest.writeString(imageFileName);
        dest.writeStringList(emojis);
        dest.writeLong(size_local);
    }

    public Uri getUriAsUri() {
        return uri_local == null ? Uri.parse(getUrlPath()) : uri_local;
    }

    public String getUrlPath() {
        try {
            return uri.replaceAll(" ", "%20");
        } catch (Exception e) {
            return uri;
        }
    }

    public String getImageFileName() {
        return imageFileName;
    }

    public void setUri(String uri) {
        this.uri = uri;
    }

    public void setUri_local(Uri uri_local) {
        this.uri_local = uri_local;
    }

    public long getSize_local() {
        return size_local;
    }

    public void setSize_local(long size_local) {
        this.size_local = size_local;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    @Override
    public String toString() {
        return "Sticker{" +
                "isAnimated='" + isAnimated + '\'' +
                "imageFileName='" + imageFileName + '\'' +
                ", emojis=" + emojis +
                ", uri='" + uri + '\'' +
                ", size='" + size + '\'' +
                ", uri_local=" + uri_local +
                ", size_local=" + size_local +
                '}';
    }

    public boolean isAnimated() {
        return isAnimated;
    }

    public void setAnimated(boolean animated) {
        isAnimated = animated;
    }
}
