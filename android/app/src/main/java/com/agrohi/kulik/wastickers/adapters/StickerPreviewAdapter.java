package com.agrohi.kulik.wastickers.adapters;

import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import android.net.Uri;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.widget.ImageView;
import android.widget.TextView;

import com.agrohi.kulik.wastickers.activities.StickerPreviewViewHolder;
import com.agrohi.kulik.wastickers.models.Sticker;
import com.agrohi.kulik.wastickers.utils.WhitelistCheck;
import com.agrohi.kulik.wastickers.models.StickerPack;
import com.agrohi.kulik.R;
import com.facebook.drawee.backends.pipeline.Fresco;


public class StickerPreviewAdapter extends RecyclerView.Adapter<StickerPreviewViewHolder> {

    @NonNull
    private StickerPack stickerPack;
    private final int cellSize;
    private int cellLimit;
    private int cellPadding;
    private final int errorResource;

    View.OnClickListener clickListener;
    private final LayoutInflater layoutInflater;

    public StickerPreviewAdapter(
            @NonNull final LayoutInflater layoutInflater,
            final int errorResource,
            final int cellSize,
            final int cellPadding,
            @NonNull final StickerPack stickerPack, View.OnClickListener clickListener) {
        this.cellSize = cellSize;
        this.cellPadding = cellPadding;
        this.cellLimit = 0;
        this.layoutInflater = layoutInflater;
        this.errorResource = errorResource;
        this.stickerPack = stickerPack;
        this.clickListener = clickListener;
    }

    @NonNull
    @Override
    public StickerPreviewViewHolder onCreateViewHolder(@NonNull final ViewGroup viewGroup, final int i) {
        View itemView = layoutInflater.inflate(R.layout.sticker_image, viewGroup, false);
        StickerPreviewViewHolder vh = new StickerPreviewViewHolder(itemView);

        ViewGroup.LayoutParams layoutParams = vh.stickerPreviewView.getLayoutParams();
        layoutParams.height = cellSize;
        layoutParams.width = cellSize;
        vh.stickerPreviewView.setLayoutParams(layoutParams);
        vh.stickerPreviewView.setPadding(cellPadding, cellPadding, cellPadding, cellPadding);
        return vh;
    }

    @Override
    public void onBindViewHolder(@NonNull final StickerPreviewViewHolder stickerPreviewViewHolder, final int pos) {
      /*if (pos == stickerPack.getStickers().size()) {
            model = new Sticker("", Uri.parse(""), new ArrayList<>());
            stickerPreviewViewHolder.img_delSticker.setVisibility(View.GONE);
        } else {
            model = stickerPack.getSticker(pos);
            stickerPreviewViewHolder.img_delSticker.setVisibility(View.VISIBLE);
        }*/

        Sticker model = stickerPack.getSticker(pos);

        Context thisContext = stickerPreviewViewHolder.stickerPreviewView.getContext();
        stickerPreviewViewHolder.stickerPreviewView.setImageResource(errorResource);
        stickerPreviewViewHolder.stickerPreviewView.setTag(pos);
        stickerPreviewViewHolder.stickerPreviewView.setOnClickListener(clickListener);

        if (!TextUtils.isEmpty(model.getImageFileName())) {
            //  stickerPreviewViewHolder.stickerPreviewView.setImageURI((model.getUriAsUri() != null) ? model.getUriAsUri() : Uri.parse(model.getUri()));
            stickerPreviewViewHolder.stickerPreviewView.setController(Fresco.newDraweeControllerBuilder()
                    .setUri(model.getUriAsUri())
                    .setAutoPlayAnimations(true)
                    .build());
            if (stickerPack.isDefaultPack())
                stickerPreviewViewHolder.img_delSticker.setVisibility(View.GONE);
            else
                stickerPreviewViewHolder.img_delSticker.setVisibility(View.VISIBLE);
        } else {
            stickerPreviewViewHolder.stickerPreviewView.setImageResource(R.drawable.add_icon);
            stickerPreviewViewHolder.img_delSticker.setVisibility(View.GONE);
        }

        stickerPreviewViewHolder.img_delSticker.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                AlertDialog.Builder dialogBuilder = new AlertDialog.Builder(thisContext);
                View dialogView = layoutInflater.inflate(R.layout.custom_dialog_deleteimage, null);
                dialogBuilder.setView(dialogView);
                TextView btn_no = dialogView.findViewById(R.id.btn_no);
                TextView btn_yes = dialogView.findViewById(R.id.btn_yes);
                TextView tv_title = dialogView.findViewById(R.id.tv_title);
                ImageView image = dialogView.findViewById(R.id.iv_dialog);
                image.setImageURI(model.getUriAsUri());
                tv_title.setText(R.string.delete_sticker_dialog_title);

                AlertDialog alertDialog = dialogBuilder.create();
                alertDialog.setTitle(thisContext.getString(R.string.label_warning));
                btn_no.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View view) {
                        alertDialog.dismiss();
                    }
                });

                btn_yes.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View view) {
                        if (stickerPack.getActualStickers().size() > 3 || !WhitelistCheck.isWhitelisted(thisContext, stickerPack.getIdentifier())) {
                            try {
                                alertDialog.dismiss();
                                stickerPack.deleteSticker(pos, model);
                                notifyDataSetChanged();
                            } catch (Exception e) {
                            }
                        } else {
                            alertDialog.dismiss();
                            AlertDialog alertDialog = new AlertDialog.Builder(thisContext)
                                    .setNegativeButton("Ok", new DialogInterface.OnClickListener() {
                                        @Override
                                        public void onClick(DialogInterface dialogInterface, int i) {
                                            dialogInterface.dismiss();
                                        }
                                    }).create();
                            alertDialog.setTitle(thisContext.getString(R.string.label_warning));
                            alertDialog.setMessage("This sticker pack has already applied to WhatsApp cannot have less than 3 stickers. " +
                                    "In order to remove additional stickers, please add more to the pack first or remove the pack from the WhatsApp app.");
                            alertDialog.show();
                        }
                    }
                });
//                alertDialog.requestWindowFeature(Window.FEATURE_NO_TITLE);
                alertDialog.show();
            }
        });
    }

    @Override
    public int getItemViewType(int position) {
        return position;
    }

    @Override
    public int getItemCount() {
        return stickerPack.getStickers().size();
    }
}
