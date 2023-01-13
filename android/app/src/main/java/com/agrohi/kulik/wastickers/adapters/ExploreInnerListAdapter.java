package com.agrohi.kulik.wastickers.adapters;

import android.content.Context;
import android.content.Intent;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.RelativeLayout;
import android.widget.TextView;

import com.agrohi.kulik.R;
import com.agrohi.kulik.wastickers.activities.StickerPackDetailsActivity;
import com.agrohi.kulik.wastickers.models.StickerPack;
import com.agrohi.kulik.wastickers.utils.GlobalFun;

import java.util.ArrayList;

public class ExploreInnerListAdapter extends RecyclerView.Adapter<ExploreInnerListAdapter.ViewHolder> {

    ClickListener clickListener;
    Context context;
    ArrayList<StickerPack> stickerPack = new ArrayList<>();
    ExploreInnerItemGridAdapter exploreInnerItemGridAdapter;

    public ExploreInnerListAdapter(Context context, ArrayList<StickerPack> stickerPack) {
        this.context = context;
        this.stickerPack = stickerPack;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int i) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_explore_inner_list, parent, false);
        ViewHolder viewHolder = new ViewHolder(view);
        return viewHolder;
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder viewHolder, final int i) {
        viewHolder.tvTitle.setText(stickerPack.get(i).getName());
        viewHolder.tvName.setText(stickerPack.get(i).getPublisher());

        GridLayoutManager mLayoutManagerCalls = new GridLayoutManager(context, 2, GridLayoutManager.VERTICAL, false);
        viewHolder.recyclerGrid.setLayoutManager(mLayoutManagerCalls);
        viewHolder.recyclerGrid.setHasFixedSize(true);
        exploreInnerItemGridAdapter = new ExploreInnerItemGridAdapter(context, stickerPack.get(i).getStickers(), new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                StickerPack stickerPackModel = stickerPack.get(i);
                stickerPackModel.setDefaultPack(true);

                Intent intent = new Intent(context, StickerPackDetailsActivity.class);
                intent.putExtra(GlobalFun.KeyDetailStickersList, stickerPackModel.tojson());
                context.startActivity(intent);
            }
        });
        viewHolder.recyclerGrid.setAdapter(exploreInnerItemGridAdapter);
        viewHolder.rlExploreList.setTag(i);

        /*viewHolder.rlExploreList.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                int pos = (int) v.getTag();
                Intent intent = new Intent(context, StickerPackDetailsActivity.class);
                intent.putExtra("DetailStickers", new Gson().toJson(stickerPack.get(pos)));
                context.startActivity(intent);
            }
        });

        viewHolder.gridView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                Intent intent = new Intent(context, StickerPackDetailsActivity.class);
                intent.putExtra("DetailStickers", new Gson().toJson(stickerPack.get(i)));
                context.startActivity(intent);
            }
        });*/
    }

    @Override
    public int getItemCount() {
        if (stickerPack == null) {
            return 0;
        }
        return stickerPack.size();
    }

    public class ViewHolder extends RecyclerView.ViewHolder implements View.OnClickListener {
        TextView tvTitle, tvName;
        RecyclerView recyclerGrid;
        RelativeLayout rlExploreList;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            tvName = itemView.findViewById(R.id.tvName);
            tvTitle = itemView.findViewById(R.id.tvTitle);
            recyclerGrid = itemView.findViewById(R.id.recyclerGrid);
            rlExploreList = itemView.findViewById(R.id.rlExploreList);

            itemView.setOnClickListener(this);
        }

        @Override
        public void onClick(View v) {
            if (clickListener != null) {
                clickListener.onClick(v, getAdapterPosition());
            }
        }
    }

    public void setClickListener(ClickListener clickListener) {
        this.clickListener = clickListener;
    }

    public interface ClickListener {
        void onClick(View v, int position);
    }
}
