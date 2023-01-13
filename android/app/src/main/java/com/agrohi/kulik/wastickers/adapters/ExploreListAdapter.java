package com.agrohi.kulik.wastickers.adapters;

import android.content.Context;
import android.content.Intent;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Filter;
import android.widget.Filterable;
import android.widget.TextView;

import com.agrohi.kulik.R;
import com.agrohi.kulik.wastickers.activities.StickerPackDetailsActivity;
import com.agrohi.kulik.wastickers.activities.StickerPackListActivity;
import com.agrohi.kulik.wastickers.models.ApiStickersListResponse;
import com.agrohi.kulik.wastickers.models.StickerPack;
import com.agrohi.kulik.wastickers.utils.GlobalFun;

import java.util.ArrayList;


public class ExploreListAdapter extends RecyclerView.Adapter<ExploreListAdapter.ViewHolder> implements Filterable {
    Context context;
    ClickListener clickListener;
    ArrayList<ApiStickersListResponse.Data> allStickers = new ArrayList<>();
    ArrayList<ApiStickersListResponse.Data> stickerPacksFiltred = new ArrayList<>();
//    AdmobAdsClass admobAdsClass;

//    public ExploreListAdapter(Context context, ArrayList<ApiStickersListResponse.Data> allStickers, AdmobAdsClass admobAdsClass)
    public ExploreListAdapter(Context context, ArrayList<ApiStickersListResponse.Data> allStickers) {
        this.context = context;
        this.allStickers = allStickers;
        this.stickerPacksFiltred = allStickers;
//        this.admobAdsClass = admobAdsClass;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int i) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_explorelist, parent, false);
        ViewHolder viewHolder = new ViewHolder(view);
        return viewHolder;
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder viewHolder, final int i) {
        ApiStickersListResponse.Data model = allStickers.get(i);
        viewHolder.tvTitle.setText(model.getCategoryName());
        viewHolder.rvList.setLayoutManager(new LinearLayoutManager(context, LinearLayoutManager.HORIZONTAL, false));
        ExploreInnerListAdapter adapter = new ExploreInnerListAdapter(context, model.getStickerPack());
        viewHolder.rvList.setAdapter(adapter);
        viewHolder.tvMore.setTag(i);

        viewHolder.tvMore.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
//                try {
//                    admobAdsClass.showIntrestrialAds(context, new admobCloseEvent() {
//                        @Override
//                        public void setAdmobCloseEvent() {
//                            stickerPackMoreButtonClick(model);
//                        }
//                    });
//                } catch (Exception e) {
//                    stickerPackMoreButtonClick(model);
//                }
            }
        });

        adapter.setClickListener(new ExploreInnerListAdapter.ClickListener() {
            @Override
            public void onClick(View v, int position) {
                int innerPos = (int) v.getTag();
                StickerPack stickerPack = model.getStickerPack().get(innerPos);
                stickerPack.setDefaultPack(true);

                Intent intent = new Intent(context, StickerPackDetailsActivity.class);
                intent.putExtra(GlobalFun.KeyDetailStickersList, stickerPack.tojson());
                context.startActivity(intent);
            }
        });
    }

    private void stickerPackMoreButtonClick(ApiStickersListResponse.Data model) {
        Intent intent = new Intent(context, StickerPackListActivity.class);
        intent.putExtra(GlobalFun.KeyStickerPackList, model.tojson());
        context.startActivity(intent);
    }

    @Override
    public Filter getFilter() {
        return new Filter() {
            @Override
            protected FilterResults performFiltering(CharSequence charSequence) {
                String charString = charSequence.toString();
                if (TextUtils.isEmpty(charString)) {
                    allStickers = stickerPacksFiltred;
                } else {
                    ArrayList<ApiStickersListResponse.Data> filteredList = new ArrayList<>();
                    for (ApiStickersListResponse.Data row : stickerPacksFiltred) {
                        if (row.getCategoryName().toLowerCase().contains(charString.toLowerCase())) {
                            filteredList.add(row);
                            break;
                        }
                        for (StickerPack stickerPack : row.getStickerPack()) {
                            if (stickerPack.getName().toLowerCase().contains(charString.toLowerCase())) {
                                filteredList.add(row);
                                break;
                            }
                        }
                    }
                    allStickers = filteredList;
                }

                FilterResults filterResults = new FilterResults();
                filterResults.values = allStickers;
                return filterResults;
            }

            @Override
            protected void publishResults(CharSequence charSequence, FilterResults filterResults) {
                allStickers = (ArrayList<ApiStickersListResponse.Data>) filterResults.values;
                notifyDataSetChanged();
            }
        };
    }

    @Override
    public int getItemCount() {
        return allStickers.size();
    }

    public class ViewHolder extends RecyclerView.ViewHolder implements View.OnClickListener {
        TextView tvTitle, tvMore;
        RecyclerView rvList;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            tvMore = itemView.findViewById(R.id.tvMore);
            tvTitle = itemView.findViewById(R.id.tvTitle);
            rvList = itemView.findViewById(R.id.rvList);
            itemView.setOnClickListener(this);
        }

        @Override
        public void onClick(View v) {
            if (clickListener != null)
                clickListener.onClick(v, getAdapterPosition());
        }
    }

    public void setClickListener(ClickListener clickListener) {
        this.clickListener = clickListener;
    }

    public interface ClickListener {
        void onClick(View v, int position);
    }
}
