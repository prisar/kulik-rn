package com.agrohi.kulik.wastickers.adapters;

import android.content.Context;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import com.agrohi.kulik.R;
import com.agrohi.kulik.wastickers.models.Sticker;
import com.facebook.drawee.backends.pipeline.Fresco;
import com.facebook.drawee.view.SimpleDraweeView;

import java.util.List;

public class ExploreInnerItemGridAdapter extends RecyclerView.Adapter<ExploreInnerItemGridAdapter.MyViewHolder> {
    List<Sticker> stickersArrayList;
    Context context;
    View.OnClickListener onClickListener;

    public ExploreInnerItemGridAdapter(Context context, List<Sticker> stickersArrayList, View.OnClickListener onClickListener) {
        this.stickersArrayList = stickersArrayList;
        this.context = context;
        this.onClickListener = onClickListener;
    }

    @NonNull
    @Override
    public MyViewHolder onCreateViewHolder(@NonNull ViewGroup viewGroup, int i) {
        View itemView = LayoutInflater.from(viewGroup.getContext()).inflate(R.layout.item_exploreinneritemgridadapter, viewGroup, false);
        return new MyViewHolder(itemView);
    }

    @Override
    public void onBindViewHolder(@NonNull MyViewHolder holder, int pos) {
        holder.iconImage.setController(Fresco.newDraweeControllerBuilder()
                .setUri(stickersArrayList.get(pos).getUriAsUri())
                .setAutoPlayAnimations(true)
                .build());
        holder.iconImage.setOnClickListener(onClickListener);
    }

    @Override
    public int getItemCount() {
        return (stickersArrayList.size() > 4) ? 4 : stickersArrayList.size();
    }

    public class MyViewHolder extends RecyclerView.ViewHolder {
        SimpleDraweeView iconImage;

        public MyViewHolder(View view) {
            super(view);
            iconImage = itemView.findViewById(R.id.iconImage);
        }
    }

    @Override
    public int getItemViewType(int position) {
        return position;
    }
}
