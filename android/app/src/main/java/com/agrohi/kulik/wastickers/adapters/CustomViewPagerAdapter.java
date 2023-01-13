package com.agrohi.kulik.wastickers.adapters;

import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentManager;
import androidx.fragment.app.FragmentPagerAdapter; // deprecation stage

import com.agrohi.kulik.wastickers.models.TabDetailsModel;

import java.util.ArrayList;

public class CustomViewPagerAdapter extends FragmentPagerAdapter {
    private final ArrayList<TabDetailsModel> tabDetailsArrayList = new ArrayList<>();

    public CustomViewPagerAdapter(FragmentManager manager) {
        super(manager);
    }

    @Override
    public Fragment getItem(int position) {
        return tabDetailsArrayList.get(position).getFragment();
    }

    @Override
    public int getCount() {
        return tabDetailsArrayList.size();
    }

    public void addFragment(TabDetailsModel tabDetail) {
        tabDetailsArrayList.add(tabDetail);
    }

    @Override
    public CharSequence getPageTitle(int position) {
        return tabDetailsArrayList.get(position).getTabName();
    }
}
