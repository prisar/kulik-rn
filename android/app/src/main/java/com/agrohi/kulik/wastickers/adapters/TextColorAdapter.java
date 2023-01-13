package com.agrohi.kulik.wastickers.adapters;

import android.content.Context;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.agrohi.kulik.R;
import com.agrohi.kulik.wastickers.interfaces.OnClickListner;
import com.bumptech.glide.Glide;

import java.util.ArrayList;

import static com.bumptech.glide.load.resource.drawable.DrawableTransitionOptions.withCrossFade;

public class TextColorAdapter extends RecyclerView.Adapter<TextColorAdapter.Holder> {

    private ArrayList<Integer> dataSet;
    public OnClickListner onClickLIstner;
    Context context;

    public TextColorAdapter(Context context, ArrayList<Integer> colorArray) {
        this.context = context;
        this.dataSet = colorArray;
    }


    @NonNull
    @Override
    public TextColorAdapter.Holder onCreateViewHolder(@NonNull ViewGroup parent, int i) {

        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.text_raw_color, parent, false);
        //view.setOnClickListener(MainActivity.myOnClickListener);

        Holder myViewHolder = new Holder(view);
        return myViewHolder;
    }

    public void setOnClickLIstner(OnClickListner onClickLIstner) {
        this.onClickLIstner = onClickLIstner;
    }

    @Override
    public void onBindViewHolder(@NonNull TextColorAdapter.Holder holder, final int listPosition) {

        Log.e("COLOR", "-----color-11--" + dataSet.size());
        Log.e("COLOR", "-----color--22----" + dataSet.get(listPosition));
        Glide.with(context)
                .load(dataSet.get(listPosition))
                .transition(withCrossFade())
                .into(holder.imageView);

        holder.imageView.setImageResource(dataSet.get(listPosition));
    }

    @Override
    public int getItemCount() {
        return dataSet.size();
    }

    public class Holder extends RecyclerView.ViewHolder implements View.OnClickListener {
        ImageView imageView;

        public Holder(@NonNull View itemView) {
            super(itemView);

            imageView = (ImageView) itemView.findViewById(R.id.iv_color);
            itemView.setOnClickListener(this);
        }

        @Override
        public void onClick(View view) {

            if (onClickLIstner != null) {
                onClickLIstner.onClick(view, dataSet.get(getAdapterPosition()), getAdapterPosition());
            }
        }
    }
}
