package com.agrohi.kulik.wastickers.models;

import androidx.fragment.app.Fragment;

public class TabDetailsModel {
    private String tabName;
    private Fragment fragment;

    public TabDetailsModel(String tabName, Fragment fragment) {
        this.fragment = fragment;
        this.tabName = tabName;
    }

    public String getTabName() {
        return tabName;
    }

    public void setTabName(String tabName) {
        this.tabName = tabName;
    }

    public Fragment getFragment() {
        return fragment;
    }
}
