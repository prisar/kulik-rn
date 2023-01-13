package com.agrohi.kulik.wastickers.api;

import com.google.gson.JsonObject;

import io.reactivex.Single;
import retrofit2.http.GET;

public interface ApiService {

    @GET("stickersAggregator")
    Single<JsonObject> getAllStickers();
}
