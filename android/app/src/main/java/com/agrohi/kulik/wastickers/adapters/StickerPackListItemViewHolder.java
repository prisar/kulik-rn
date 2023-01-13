package com.agrohi.kulik.wastickers.adapters;

import androidx.recyclerview.widget.RecyclerView;
import android.view.View;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.agrohi.kulik.R;
import com.facebook.drawee.view.SimpleDraweeView;

public class StickerPackListItemViewHolder extends RecyclerView.ViewHolder {
    View container;
    TextView titleView;
    TextView publisherView;
    //TextView filesizeView;
    ImageView addButton;
    SimpleDraweeView bigcateicon;
    //ImageView shareButton;
    public LinearLayout imageRowView;

    StickerPackListItemViewHolder(final View itemView) {
        super(itemView);
        container = itemView;
        titleView = itemView.findViewById(R.id.sticker_pack_title);
        publisherView = itemView.findViewById(R.id.sticker_pack_publisher);
        //filesizeView = itemView.findViewById(R.id.sticker_pack_filesize);
        bigcateicon = itemView.findViewById(R.id.bigcateicon);
        addButton = itemView.findViewById(R.id.add_button_on_list);
        //shareButton = itemView.findViewById(R.id.export_button_on_list);
        imageRowView = itemView.findViewById(R.id.sticker_packs_list_item_image_list);
    }
}
