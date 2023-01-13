package com.agrohi.kulik.wastickers.base;

import android.os.Bundle;
import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import com.agrohi.kulik.wastickers.api.ApiClient;
import com.agrohi.kulik.wastickers.api.ApiService;
import com.agrohi.kulik.wastickers.utils.GlobalFun;

public abstract class BaseFragment extends Fragment {

    private GlobalFun globalFun;

    protected abstract int getFragmentLayout();

    protected abstract void initViewsHere();

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        return inflater.inflate(getFragmentLayout(), container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        initViewsHere();
        globalFun = new GlobalFun();
    }

    public ApiService getApiClientObj() {
        return ApiClient.getClient()
                .create(ApiService.class);
    }

    protected void openActivity(Class<?> className) {
        globalFun.openActivity(getActivity(), className);
    }

    protected void openActivity(Class<?> className, String jsonData) {
        globalFun.openActivity(getActivity(), className, jsonData);
    }

    protected void showToast(String message) {
        globalFun.showToast(getActivity(), message);
    }

    protected void showToast(int message) {
        globalFun.showToast(getActivity(), message);
    }

    protected void showLog(String tag, String message) {
        globalFun.showLog(tag, message);
    }

    protected void showSnackBar(View layout, String message) {
        globalFun.showSnackBar(layout, message);
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
    }

//    protected void shareApp(String message) {
//        globalFun.shareApp(getActivity());
//    }
//
//    private void rateUsApp(String destPkgName) {
//        globalFun.RateUsApp(getActivity(), destPkgName);
//    }
//
//    public void privacyPolicy() {
//        globalFun.privacyPolicy(getActivity());
//    }
//
//    public void internetFailedDialog() {
//        globalFun.internetFailedDialog(getActivity());
//    }
}
