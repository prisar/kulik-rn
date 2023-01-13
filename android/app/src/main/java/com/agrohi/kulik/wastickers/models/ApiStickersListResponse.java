package com.agrohi.kulik.wastickers.models;

import android.os.Parcel;
import android.os.Parcelable;

import androidx.annotation.Keep;

import com.google.gson.Gson;

import java.util.ArrayList;

@Keep
public class ApiStickersListResponse {

    private String result;

    private ArrayList<Data> data;

    private String message;

    private String status;

    public String getResult() {
        return result;
    }

    public boolean getResultAsBoolean() {
        try {
            return Boolean.parseBoolean(result);
        } catch (Exception e) {
            return false;
        }
    }

    public void setResult(String result) {
        this.result = result;
    }

    public ArrayList<Data> getData() {
        return data;
    }

    public void setData(ArrayList<Data> data) {
        this.data = data;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    @Override
    public String toString() {

        return "ClassPojo [result = " + result + ", data = " + data + ", message = " + message + ", status = " + status + "]";

    }

    public class Data implements Parcelable {

        private String categoryName;

        private ArrayList<StickerPack> stickerPack;

        protected Data(Parcel in) {
            categoryName = in.readString();
            stickerPack = in.createTypedArrayList(StickerPack.CREATOR);
        }

        public final Creator<Data> CREATOR = new Creator<Data>() {
            @Override
            public Data createFromParcel(Parcel in) {
                return new Data(in);
            }

            @Override
            public Data[] newArray(int size) {
                return new Data[size];
            }
        };

        public String getCategoryName() {
            return categoryName;
        }

        public void setCategoryName(String categoryName) {
            this.categoryName = categoryName;
        }

        public ArrayList<StickerPack> getStickerPack() {
            return stickerPack;
        }

        public void setStickerPack(ArrayList<StickerPack> stickerPack) {
            this.stickerPack = stickerPack;
        }

        @Override
        public String toString() {
            return "ClassPojo [categoryName = " + categoryName + ", stickerPack = " + stickerPack + "]";
        }

        @Override
        public int describeContents() {
            return 0;
        }

        @Override
        public void writeToParcel(Parcel dest, int flags) {
            dest.writeString(categoryName);
            dest.writeTypedList(stickerPack);
        }

        public String tojson() {
            return new Gson().toJson(this);
        }
    }

    /*public class Sticker {
        private ArrayList<String> emojis;

        private String size;

        private String imageFileName;

        private String uri;

        public ArrayList<String> getEmojis() {
            return emojis;
        }

        public void setEmojis(ArrayList<String> emojis) {
            this.emojis = emojis;
        }

        public String getSize() {
            return size;
        }

        public void setSizeAsLong(String size) {
            this.size = size;
        }

        public String getImageFileName() {
            return imageFileName;
        }

        public void setImageFileName(String imageFileName) {
            this.imageFileName = imageFileName;
        }

        public String getUriAsUri() {
            return uri;
        }

        public void setUri(String uri) {
            this.uri = uri;
        }

        @Override
        public String toString() {
            return "ClassPojo [emojis = " + emojis + ", size = " + size + ", imageFileName = " + imageFileName + ", uri = " + uri + "]";
        }
    }

    public class StickerPack {
        private String identifier;

        private String trayImageUri;

        private String isWhitelisted;

        private String trayImageFile;

        private String privacyPolicyWebsite;

        private String licenseAgreementWebsite;

        private String publisherWebsite;

        private String totalSize;

        private String name;

        private String publisher;

        private ArrayList<Sticker> stickers;

        private String publisherEmail;

        private String stickersAddedIndex;

        public String getIdentifier() {
            return identifier;
        }

        public void setIdentifier(String identifier) {
            this.identifier = identifier;
        }

        public String getTrayImageUri() {
            return trayImageUri;
        }

        public void setLocalTrayImageUri(String trayImageUri) {
            this.trayImageUri = trayImageUri;
        }

        public String getIsWhitelisted() {
            return isWhitelisted;
        }

        public void setIsWhitelisted(String isWhitelisted) {
            this.isWhitelisted = isWhitelisted;
        }

        public String getTrayImageFile() {
            return trayImageFile;
        }

        public void setTrayImageFile(String trayImageFile) {
            this.trayImageFile = trayImageFile;
        }

        public String getPrivacyPolicyWebsite() {
            return privacyPolicyWebsite;
        }

        public void setPrivacyPolicyWebsite(String privacyPolicyWebsite) {
            this.privacyPolicyWebsite = privacyPolicyWebsite;
        }

        public String getLicenseAgreementWebsite() {
            return licenseAgreementWebsite;
        }

        public void setLicenseAgreementWebsite(String licenseAgreementWebsite) {
            this.licenseAgreementWebsite = licenseAgreementWebsite;
        }

        public String getPublisherWebsite() {
            return publisherWebsite;
        }

        public void setPublisherWebsite(String publisherWebsite) {
            this.publisherWebsite = publisherWebsite;
        }

        public String getTotalSize_local() {
            return totalSize;
        }

        public void setTotalSize(String totalSize) {
            this.totalSize = totalSize;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getPublisher() {
            return publisher;
        }

        public void setPublisher(String publisher) {
            this.publisher = publisher;
        }

        public ArrayList<Sticker> getStickers() {
            return stickers;
        }

        public void setStickers(ArrayList<Sticker> stickers) {
            this.stickers = stickers;
        }

        public String getPublisherEmail() {
            return publisherEmail;
        }

        public void setPublisherEmail(String publisherEmail) {
            this.publisherEmail = publisherEmail;
        }

        public String getStickersAddedIndex() {
            return stickersAddedIndex;
        }

        public void setStickersAddedIndex(String stickersAddedIndex) {
            this.stickersAddedIndex = stickersAddedIndex;
        }

        @Override
        public String toString() {
            return "ClassPojo [identifier = " + identifier + ", trayImageUri = " + trayImageUri + ", isWhitelisted = " + isWhitelisted + ", trayImageFile = " + trayImageFile + ", privacyPolicyWebsite = " + privacyPolicyWebsite + ", licenseAgreementWebsite = " + licenseAgreementWebsite + ", publisherWebsite = " + publisherWebsite + ", totalSize = " + totalSize + ", name = " + name + ", publisher = " + publisher + ", stickers = " + stickers + ", publisherEmail = " + publisherEmail + ", stickersAddedIndex = " + stickersAddedIndex + "]";
        }
    }*/
}
