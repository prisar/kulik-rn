package com.agrohi.kulik.wastickers.adapters;

import android.content.Context;
import android.graphics.Typeface;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.recyclerview.widget.RecyclerView;

import com.agrohi.kulik.R;
import com.agrohi.kulik.wastickers.interfaces.OnClickFont;

import java.util.ArrayList;

public class TextAdapter extends RecyclerView.Adapter<TextAdapter.MyViewHolder> {

    public OnClickFont onClickLIstner;
    Context context;
    private ArrayList<String> fontArray;

    public TextAdapter(Context context, ArrayList<String> fontArray) {
        this.context = context;
        this.fontArray = fontArray;
        Log.e("---------","----fontArray-----0"+fontArray.size());
    }

    public void setOnClickLIstner(OnClickFont onClickLIstner) {
        this.onClickLIstner = onClickLIstner;
    }

    @Override
    public MyViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.text_view_raw_text, parent, false);
        //view.setOnClickListener(MainActivity.myOnClickListener);
        MyViewHolder myViewHolder = new MyViewHolder(view);
        return myViewHolder;
    }

    @Override
    public void onBindViewHolder(final MyViewHolder holder, final int listPosition) {
        holder.textView.setText("Name");
        holder.textView.setTypeface(Typeface.createFromAsset(context.getAssets(), fontArray.get(listPosition)));
    }

    @Override
    public int getItemCount() {
        return fontArray.size();
    }

    public class MyViewHolder extends RecyclerView.ViewHolder implements View.OnClickListener {

        TextView textView;

        public MyViewHolder(View itemView) {
            super(itemView);
            textView = (TextView) itemView.findViewById(R.id.textView);
            itemView.setOnClickListener(this);
        }

        @Override
        public void onClick(View v) {
            if (onClickLIstner != null) {
                onClickLIstner.onFontClick(v, fontArray.get(getAdapterPosition()), getAdapterPosition());
            }
        }
    }
}
