//
//   +y
//    ^
//                     d,d,-d
//     H ------------- G
//    /|              /|
//   / |             / |
//  E ------------- F  |
//  |  |            |  |      -z(north) 
//  |  |            |  |      /         
//  |  D -----------|- C
//  | /             | /
//  |/              |/                  
//  A ------------- B     >   +x        
//  -d,-d,d
// +z south
//

WHITE = vec4.fromValues(1,1,1,1);

// LineSegmentsで箱を描画するために必要な24個の頂点
function setLineBoxGeom(geom,xsz,ysz,zsz,col) {
    var a=vec3.fromValues(-xsz,-ysz,zsz);// A
    var b=vec3.fromValues(xsz,-ysz,zsz); // B
    var c=vec3.fromValues(xsz,-ysz,-zsz); // C 
    var d=vec3.fromValues(-xsz,-ysz,-zsz); // D
    var e=vec3.fromValues(-xsz,ysz,zsz); // E 
    var f=vec3.fromValues(xsz,ysz,zsz); // F 
    var g=vec3.fromValues(xsz,ysz,-zsz); // G 
    var h=vec3.fromValues(-xsz,ysz,-zsz); // H
    var ary=[a,b, b,f, f,e, e,a,  b,c, a,d, d,c, c,g,  g,h, h,d, f,g, e,h];
    for(var i=0;i<24;i++) {
        geom.setPosition3v(i,ary[i]);
        geom.setColor4v(i,col);
        geom.setIndex(i,i);
    }
}



// 面ごとに個別のUVを設定するために、8個じゃなくて24個の頂点が必要。
function pushBox24Verts(geom,xsz,ysz,zsz,xofs,yofs,zofs, vert_ind_ofs) {
    vert_ind_ofs|=0;
    if(xofs==undefined)xofs=0;
    if(yofs==undefined)yofs=0;
    if(zofs==undefined)zofs=0;
    var a=vec3.fromValues(-xsz+xofs,-ysz+yofs,zsz+zofs);// A
    var b=vec3.fromValues(xsz+xofs,-ysz+yofs,zsz+zofs); // B
    var c=vec3.fromValues(xsz+xofs,-ysz+yofs,-zsz+zofs); // C 
    var d=vec3.fromValues(-xsz+xofs,-ysz+yofs,-zsz+zofs); // D
    var e=vec3.fromValues(-xsz+xofs,ysz+yofs,zsz+zofs); // E 
    var f=vec3.fromValues(xsz+xofs,ysz+yofs,zsz+zofs); // F 
    var g=vec3.fromValues(xsz+xofs,ysz+yofs,-zsz+zofs); // G 
    var h=vec3.fromValues(-xsz+xofs,ysz+yofs,-zsz+zofs); // H

    var o=vert_ind_ofs;    
    geom.setPosition3v(0+o,a); geom.setPosition3v(1+o,b); geom.setPosition3v(2+o,c); geom.setPosition3v(3+o,d); // abcd: adb,dcb
    geom.setPosition3v(4+o,e); geom.setPosition3v(5+o,f); geom.setPosition3v(6+o,g); geom.setPosition3v(7+o,h); // efgh: hfg,efh
    geom.setPosition3v(8+o,a); geom.setPosition3v(9+o,d); geom.setPosition3v(10+o,h); geom.setPosition3v(11+o,e); // adhe, eda,ehd
    geom.setPosition3v(12+o,b); geom.setPosition3v(13+o,c); geom.setPosition3v(14+o,g); geom.setPosition3v(15+o,f); // bcgf: fbc,fcg
    geom.setPosition3v(16+o,e); geom.setPosition3v(17+o,a); geom.setPosition3v(18+o,b); geom.setPosition3v(19+o,f); // eabf: eab,ebf
    geom.setPosition3v(20+o,h); geom.setPosition3v(21+o,d); geom.setPosition3v(22+o,c); geom.setPosition3v(23+o,g); // hdcg: hcd,hgc
    geom.need_positions_update=true;
}


function pushCubeVertFace(geom,d) {
    return pushBoxVertFace(geom,d,d,d,WHITE);
}
//xsz:辺の半分の長さ
function pushBoxVertFace(geom,xsz,ysz,zsz,col) {
    pushBox24Verts(geom,xsz,ysz,zsz);
    pushBox12Faces(geom);
    fillAllVertsWithColor(geom,col);
}
function pushBox12Faces(geom,v_ofs,i_ofs) {
    var vo=v_ofs||0;
    var io=i_ofs||0;
    // bottom
    geom.setFaceInds(0+io, 0+vo,3+vo,1+vo); // ADB
    geom.setFaceInds(1+io, 3+vo,2+vo,1+vo); // DCB
    // top
    geom.setFaceInds(2+io, 7+vo,5+vo,6+vo); // HFG
    geom.setFaceInds(3+io, 4+vo,5+vo,7+vo); // EFH
    // left
    geom.setFaceInds(4+io, 11+vo,9+vo,8+vo); // EDA
    geom.setFaceInds(5+io, 11+vo,10+vo,9+vo); // EHD
    // right
    geom.setFaceInds(6+io, 15+vo,12+vo,13+vo); // FBC
    geom.setFaceInds(7+io, 15+vo,13+vo,14+vo); // FCG
    // front
    geom.setFaceInds(8+io, 16+vo,17+vo,18+vo); // EAB
    geom.setFaceInds(9+io, 16+vo,18+vo,19+vo); // EBF
    // rear
    geom.setFaceInds(10+io, 20+vo,22+vo,21+vo); // HCD
    geom.setFaceInds(11+io, 20+vo,23+vo,22+vo); // HGC
}
function fillAllVertsWithColor(geom,col) {
    for(var i=0;i<geom.vn;i++) {
        geom.colors[i*4]=col[0];
        geom.colors[i*4+1]=col[1];
        geom.colors[i*4+2]=col[2];
        geom.colors[i*4+3]=col[3];        
    }
}
// 12面構成の立体に色をつける。天面が明るい
function setFace12TopBrightColors(geom) {
    var dark=Color.fromValues(0.4,0.4,0.4,1);
    var lt=Color.fromValues(0.8,0.8,0.8,1);
    var most=Color.fromValues(1,1,1,1);
    geom.setColor4v(0,dark); geom.setColor4v(1,dark); // bottom
    geom.setColor4v(2,dark); geom.setColor4v(3,dark); // bottom    
    geom.setColor4v(4,most); geom.setColor4v(5,most); // top
    geom.setColor4v(6,most); geom.setColor4v(7,most); // top    
    for(var i=8;i<24;i++) geom.setColor4v(i,lt);
}

/*
  D-----C
  |\    |    
  |  *  |  *:center
  |    \|  A:-xsz,-zsz     ADB, BDC
  A-----B
  
 */

// makeCubeUVSetの出力を回転して、xp,xn,zp,znの4方向用にする
function makeHoriz4Dir(uvset) {
    var out={ horiz4dir:true, xp:{}, xn:{}, zp:{}, zn:{} };
    // xp:回転なし
    out.xp.adb=uvset.adb; out.xp.dcb=uvset.dcb; // bottom
    out.xp.hfg=uvset.hfg; out.xp.efh=uvset.efh; // top
    out.xp.eda=uvset.eda; out.xp.ehd=uvset.ehd; // -x
    out.xp.fbc=uvset.fbc; out.xp.fcg=uvset.fcg; // +x
    out.xp.eab=uvset.eab; out.xp.ebf=uvset.ebf; // +z
    out.xp.hcd=uvset.hcd; out.xp.hgc=uvset.hgc; // -z

    function conv021(ary) {
        return [ary[0],ary[2],ary[1]];
    }
    // xn:時計回り180度回転: xとz両方とも反転
    out.xn.adb=uvset.adb; out.xn.dcb=uvset.dcb; // bottom
    out.xn.hfg=uvset.hfg; out.xn.efh=uvset.efh; // top
    out.xn.eda=conv021(uvset.fbc); out.xn.ehd=conv021(uvset.fcg); // -x
    out.xn.fbc=conv021(uvset.eda); out.xn.fcg=conv021(uvset.ehd); // +x
    out.xn.eab=conv021(uvset.hcd); out.xn.ebf=conv021(uvset.hgc); // +z
    out.xn.hcd=conv021(uvset.eab); out.xn.hgc=conv021(uvset.ebf); // -z
    // zp:時計まわり90度回転 +xが+zになり +zが-x -xが-z -zが+x
    out.zp.adb=uvset.adb; out.zp.dcb=uvset.dcb; // bottom
    out.zp.hfg=uvset.hfg; out.zp.efh=uvset.efh; // top
    out.zp.eda=uvset.hcd; out.zp.ehd=uvset.hgc; // -x
    out.zp.fbc=uvset.eab; out.zp.fcg=uvset.ebf; // +x
    out.zp.eab=uvset.fbc; out.zp.ebf=uvset.fcg; // +z
    out.zp.hcd=uvset.eda; out.zp.hgc=uvset.ehd; // -z
    // zn: 反時計90度 +xが-z -xが+z
    out.zn.adb=uvset.adb; out.zn.dcb=uvset.dcb; // bottom
    out.zn.hfg=uvset.hfg; out.zn.efh=uvset.efh; // top
    out.zn.eda=conv021(uvset.eab); out.zn.ehd=conv021(uvset.ebf); // -x
    out.zn.fbc=conv021(uvset.hcd); out.zn.fcg=conv021(uvset.hgc); // +x
    out.zn.eab=conv021(uvset.eda); out.zn.ebf=conv021(uvset.ehd); // +z
    out.zn.hcd=conv021(uvset.fbc); out.zn.hgc=conv021(uvset.fcg);// -z
    return out;
}
function makeCubeUVSet(ind,uofs,vofs,sideind,bottomind,faceind) {
    if(uofs==undefined)uofs=0;
    if(vofs==undefined)vofs=0;
    if(sideind==undefined)sideind=ind;
    if(bottomind==undefined)bottomind=ind;
    if(faceind==undefined) faceind=ind;
    var uvrect_t=new Float32Array(4);
    g_base_deck.getUVFromIndex(uvrect_t,ind,uofs,vofs,0);
    var uvrect_s=new Float32Array(4);
    g_base_deck.getUVFromIndex(uvrect_s,sideind,uofs,vofs,0);
    var uvrect_b=new Float32Array(4);
    g_base_deck.getUVFromIndex(uvrect_b,bottomind,uofs,vofs,0);
    var uvrect_f=new Float32Array(4);
    g_base_deck.getUVFromIndex(uvrect_f,faceind,uofs,vofs,0);
    if(!uvrect_t) throw "bad index";
    var uv_t_lt=vec2.fromValues(uvrect_t[0],uvrect_t[1]);
    var uv_t_rt=vec2.fromValues(uvrect_t[2],uvrect_t[1]);
    var uv_t_lb=vec2.fromValues(uvrect_t[0],uvrect_t[3]);
    var uv_t_rb=vec2.fromValues(uvrect_t[2],uvrect_t[3]);
    var uv_s_lt=vec2.fromValues(uvrect_s[0],uvrect_s[1]);
    var uv_s_rt=vec2.fromValues(uvrect_s[2],uvrect_s[1]);
    var uv_s_lb=vec2.fromValues(uvrect_s[0],uvrect_s[3]);
    var uv_s_rb=vec2.fromValues(uvrect_s[2],uvrect_s[3]);
    var uv_b_lt=vec2.fromValues(uvrect_b[0],uvrect_b[1]);
    var uv_b_rt=vec2.fromValues(uvrect_b[2],uvrect_b[1]);
    var uv_b_lb=vec2.fromValues(uvrect_b[0],uvrect_b[3]);
    var uv_b_rb=vec2.fromValues(uvrect_b[2],uvrect_b[3]);
    var uv_f_lt=vec2.fromValues(uvrect_f[0],uvrect_f[1]);
    var uv_f_rt=vec2.fromValues(uvrect_f[2],uvrect_f[1]);
    var uv_f_lb=vec2.fromValues(uvrect_f[0],uvrect_f[3]);
    var uv_f_rb=vec2.fromValues(uvrect_f[2],uvrect_f[3]);

    
    var out={ cube:true, uvs: [ uv_t_lt,uv_t_rt,uv_t_lb,uv_t_rb,
                                uv_s_lt,uv_s_rt,uv_s_lb,uv_s_rb,
                                uv_b_lt,uv_b_rt,uv_b_lb,uv_b_rb] };
    out.adb=[uv_b_lb,uv_b_lt,uv_b_rb]; // bottom
    out.dcb=[uv_b_lt,uv_b_rt,uv_b_rb]; // bottom
    out.hfg=[uv_t_lt,uv_t_rb,uv_t_rt]; // top
    out.efh=[uv_t_lb,uv_t_rb,uv_t_lt]; // top
    out.eda=[uv_s_rt,uv_s_lb,uv_s_rb]; // -x
    out.ehd=[uv_s_rt,uv_s_lt,uv_s_lb]; // -x
    out.fbc=[uv_f_lt,uv_f_lb,uv_f_rb]; // +x
    out.fcg=[uv_f_lt,uv_f_rb,uv_f_rt]; // +x
    out.eab=[uv_s_lt,uv_s_lb,uv_s_rb]; // +z
    out.ebf=[uv_s_lt,uv_s_rb,uv_s_rt]; // +z
    out.hcd=[uv_s_lt,uv_s_rb,uv_s_lb]; // -z
    out.hgc=[uv_s_lt,uv_s_rt,uv_s_rb]; // -z
    // 水のtopの裏面用に2つ
    out.gfh=[uv_t_rt,uv_t_rb,uv_t_lt];
    out.hfe=[uv_t_lt,uv_t_rb,uv_t_lb];
    // 水の+xの裏面用に2つ
    out.cbf=[uv_s_rb,uv_s_lb,uv_s_lt]; // +x
    out.gcf=[uv_s_rt,uv_s_rb,uv_s_lt]; // +x
    // 水の-xの裏面用に2つ
    out.ade=[uv_s_rb,uv_s_lb,uv_s_rt]; // -x
    out.dhe=[uv_s_lb,uv_s_lt,uv_s_rt]; // -x
    // 水の+zの裏面用に2つ
    out.bae=[uv_s_rb,uv_s_lb,uv_s_lt]; // +z
    out.fbe=[uv_s_rt,uv_s_rb,uv_s_lt]; // +z
    // 水の-zの裏面用に2つ    
    out.dch=[uv_s_lb,uv_s_rb,uv_s_lt]; // -z
    out.cgh=[uv_s_rb,uv_s_rt,uv_s_lt]; // -z

    // 便利関数を追加しとく
    out.shiftAllUV = function(modu,modv) {
        for(var i=0;i<this.uvs.length;i++) {
            this.uvs[i].x+=modu;
            this.uvs[i].y+=modv;
        }
    }
    return out;
}
function makeCrossUVSet(ind) {
    var out={ cross:true };
    var uvrect=new Float32Array(4);
    g_base_deck.getUVFromIndex(uvrect,ind,0,0,0);
    var uv_lt=vec2.fromValues(uvrect[0],uvrect[1]);
    var uv_rt=vec2.fromValues(uvrect[2],uvrect[1]);
    var uv_lb=vec2.fromValues(uvrect[0],uvrect[3]);
    var uv_rb=vec2.fromValues(uvrect[2],uvrect[3]);
    out.hbf=[uv_lt,uv_rb,uv_rt];
    out.fbh=[uv_rt,uv_rb,uv_lt]; // ブロックのpropにまとめるとdoubleside描画をしないので反対向きも作っておく必要がある
    out.hdb=[uv_lt,uv_lb,uv_rb];
    out.bdh=[uv_rb,uv_lb,uv_lt];
    out.ecg=[uv_lt,uv_rb,uv_rt];
    out.gce=[uv_rt,uv_rb,uv_lt]; 
    out.eca=[uv_lt,uv_rb,uv_lb];
    out.ace=[uv_lb,uv_rb,uv_lt];
    return out;
}
 
// pushBox12Faces,pushbox24vertsで作った箱にUVをつける。6面とも同じuv
function pushBoxTileDeckUV(geom,ind,vert_ind_ofs) {
    var o=vert_ind_ofs||0;
    var s=makeCubeUVSet(ind);
    geom.setUV2v(0+o,s.adb[0]); geom.setUV2v(1+o,s.adb[2]); geom.setUV2v(2+o,s.dcb[1]); geom.setUV2v(3+o,s.adb[1]); //abcd
    geom.setUV2v(4+o,s.efh[0]); geom.setUV2v(5+o,s.efh[1]); geom.setUV2v(6+o,s.hfg[2]); geom.setUV2v(7+o,s.hfg[0]); // efgh
    geom.setUV2v(8+o,s.eda[2]); geom.setUV2v(9+o,s.eda[1]); geom.setUV2v(10+o,s.ehd[1]); geom.setUV2v(11+o,s.ehd[0]); //adhe
    geom.setUV2v(12+o,s.fbc[1]); geom.setUV2v(13+o,s.fbc[2]); geom.setUV2v(14+o,s.fcg[2]); geom.setUV2v(15+o,s.fcg[0]); // bcgf
    geom.setUV2v(16+o,s.eab[0]); geom.setUV2v(17+o,s.eab[1]); geom.setUV2v(18+o,s.eab[2]); geom.setUV2v(19+o,s.ebf[2]); // eabf
    geom.setUV2v(20+o,s.hcd[0]); geom.setUV2v(21+o,s.hcd[2]); geom.setUV2v(22+o,s.hgc[2]); geom.setUV2v(23+o,s.hgc[1]); // hdcg
}

// 6面に異なるindexを指定するuvセッター
// [abcd,efgh,eadh,fbcg,eabf,hgfe] : -y,+y,-x,+x,+z,-z
function pushBoxTileDeckUVArray(geom,indary) {
    if(indary.length!=6)throw ["invalid array len",indary];
    var yp=makeCubeUVSet(indary[0]);
    var yn=makeCubeUVSet(indary[1]);
    var xn=makeCubeUVSet(indary[2]);
    var xp=makeCubeUVSet(indary[3]);
    var zp=makeCubeUVSet(indary[4]);
    var zn=makeCubeUVSet(indary[5]);
    geom.setUV2v(0,yp.adb[0]); geom.setUV2v(1,yp.adb[2]); geom.setUV2v(2,yp.dcb[1]); geom.setUV2v(3,yp.adb[1]); //abcd
    geom.setUV2v(4,yn.efh[0]); geom.setUV2v(5,yn.efh[1]); geom.setUV2v(6,yn.hfg[2]); geom.setUV2v(7,yn.hfg[0]); // efgh
    geom.setUV2v(8,xn.eda[2]); geom.setUV2v(9,xn.eda[1]); geom.setUV2v(10,xn.ehd[1]); geom.setUV2v(11,xn.ehd[0]); //adhe
    geom.setUV2v(12,xp.fbc[1]); geom.setUV2v(13,xp.fbc[2]); geom.setUV2v(14,xp.fcg[2]); geom.setUV2v(15,xp.fcg[0]); // bcgf
    geom.setUV2v(16,zp.eab[0]); geom.setUV2v(17,zp.eab[1]); geom.setUV2v(18,zp.eab[2]); geom.setUV2v(19,zp.ebf[2]); // eabf
    geom.setUV2v(20,zn.hcd[0]); geom.setUV2v(21,zn.hcd[2]); geom.setUV2v(22,zn.hgc[2]); geom.setUV2v(23,zn.hgc[1]); // hdcg
}
// aryは6要素で、 [u0,v0,u1,v1]を0~16のタイル内座標(左上が0,0)で指定。
// 以下は例
//        [0,12,13,9], // bottom
//        [3,0,13,3], // top
//        [0,3,3,8], // -x
//        [13,3,16,8], // +x
//        [3,3,13,8], //+z
//        [3,3,13,8], //-z        
// [abcd,efgh,eadh,fbcg,eabf,hgfe] : -y,+y,-x,+x,+z,-z    
function pushBoxSingleTileUVArray(geom,ind, ary ) {
    var unit=1.0/16.0
    for(var i=0;i<6;i++) {
        var u0=ary[i][0], v0=ary[i][1], u1=ary[i][2], v1=ary[i][3];
        var uv=g_base_deck.getUVOfPixel(ind,u0,v0);
        ary[i][0]=uv[0];
        ary[i][1]=uv[1];
        uv=g_base_deck.getUVOfPixel(ind,u1,v1);
        ary[i][2]=uv[0];
        ary[i][3]=uv[1];
    }
    var nv2 = function(x,y) { return vec2.fromValues(x,y); }
    var btm=ary[0], top=ary[1], xn=ary[2], xp=ary[3], zp=ary[4], zn=ary[5];
    geom.setUV(0,btm[0],btm[1]); geom.setUV(1,btm[2],btm[1]); geom.setUV(2,btm[2],btm[3]); geom.setUV(3,btm[0],btm[3]); // abcd
    geom.setUV(4,top[0],top[1]); geom.setUV(5,top[2],top[1]); geom.setUV(6,top[2],top[3]); geom.setUV(7,top[0],top[3]); // efgh
    geom.setUV(8,xn[0],xn[1]); geom.setUV(9,xn[2],xn[1]); geom.setUV(10,xn[2],xn[3]); geom.setUV(11,xn[0],xn[3]); // adhe
    geom.setUV(12,xp[0],xp[1]); geom.setUV(13,xp[2],xp[1]); geom.setUV(14,xp[2],xp[3]); geom.setUV(15,xp[0],xp[3]); // bcgf
    geom.setUV(16,zp[0],zp[3]); geom.setUV(17,zp[0],zp[1]); geom.setUV(18,zp[2],zp[1]); geom.setUV(19,zp[2],zp[3]); // eabf
    geom.setUV(20,zn[0],zn[3]); geom.setUV(21,zn[0],zn[1]); geom.setUV(22,zn[2],zn[1]); geom.setUV(23,zn[2],zn[3]); // hdcg
}
// pixx0,pixy0,pixx1,pixy1は 3,3, 5,8みたいなタイル内ピクセル座標
// Z平面に並行な面を作る。もとはサカナのヒレ用で、それを回転して使う。
//      E---F (x1,y1)
//      |\  |
//      | \ |
//      |  \|
//      A---B
// (x0,y0)
function createZPanelGeomPixelPos(ind, pixx0,pixy0,pixx1,pixy1, x0,y0,x1,y1 ) {
    var z=0;
    var geom=new FaceGeometry(4,2);
    geom.setPosition(0, x0,y0,z); //A
    geom.setPosition(1, x0,y1,z); //E
    geom.setPosition(2, x1,y0,z); //B
    geom.setPosition(3, x1,y1,z); //F
    geom.setFaceInds(0, 0,2,1); // ABE
    geom.setFaceInds(1, 1,2,3); // EBF
    var uvtile0=g_base_deck.getUVOfPixel(ind,pixx0,pixy0);
    var uvtile1=g_base_deck.getUVOfPixel(ind,pixx1,pixy1);
    geom.setUV(0, uvtile0[0],uvtile1[1]); //A
    geom.setUV(1, uvtile0[0],uvtile0[1]); //E
    geom.setUV(2, uvtile1[0],uvtile1[1]); //B
    geom.setUV(3, uvtile1[0],uvtile0[1]); //F
    geom.fillColor4v(0,WHITE,4);
    return geom;    
}

function getUVRectFromIndex(ind) {
    var out={};
    var rect=new Float32Array(4);
    g_base_deck.getUVFromIndex(rect,ind,0,0,0);
    out.lt=vec2.fromValues(rect[0],rect[1]);
    out.rt=vec2.fromValues(rect[2],rect[1]);
    out.lb=vec2.fromValues(rect[0],rect[3]);
    out.rb=vec2.fromValues(rect[2],rect[3]);
    return out;
}
// それぞれの面に個別のindexを設定する
function pushBoxTileDeckUV6(geom,inds) {
    var uv_bottom=getUVRectFromIndex(inds[0]);
    var uv_top=getUVRectFromIndex(inds[1]);
    var uv_front=getUVRectFromIndex(inds[2]);
    var uv_back=getUVRectFromIndex(inds[3]);
    var uv_left=getUVRectFromIndex(inds[4]);
    var uv_right=getUVRectFromIndex(inds[5]);        
//    var out=[
//        [uv_bottom.lb,uv_bottom.lt,uv_bottom.rb], [uv_bottom.lt,uv_bottom.rt,uv_bottom.rb], //bottom adb dcb
//        [uv_top.lt,uv_top.rb,uv_top.rt], [uv_top.lb,uv_top.rb,uv_top.lt], // top hfg, efh
//        [uv_right.lt,uv_right.rb,uv_right.lb], [uv_right.lt,uv_right.rt,uv_right.rb], // キャラからみてright : eda ehd
//        [uv_left.lt,uv_left.lb,uv_left.rb], [uv_left.lt,uv_left.rb,uv_left.rt],   // left: fbc fcg
//        [uv_front.lt,uv_front.lb,uv_front.rb], [uv_front.lt,uv_front.rb,uv_front.rt], // front eab ebf
//        [uv_back.lt,uv_back.rb,uv_back.lb], [uv_back.lt,uv_back.rt,uv_back.rb] // back hcd hgc
//    ];

    geom.setUV2v(0,uv_bottom.lb); geom.setUV2v(1,uv_bottom.rb); geom.setUV2v(2,uv_bottom.rt); geom.setUV2v(3,uv_bottom.lt);  //abcd
    geom.setUV2v(4,uv_top.lb); geom.setUV2v(5,uv_top.rb); geom.setUV2v(6,uv_top.rt); geom.setUV2v(7,uv_top.lt);//efgh
    geom.setUV2v(8,uv_right.lb); geom.setUV2v(9,uv_right.rb); geom.setUV2v(10,uv_right.rt); geom.setUV2v(11,uv_right.lt); // adhe
    geom.setUV2v(12,uv_left.lb); geom.setUV2v(13,uv_left.rb); geom.setUV2v(14,uv_left.rt); geom.setUV2v(15,uv_left.lt); // bcgf
    geom.setUV2v(16,uv_front.lt); geom.setUV2v(17,uv_front.lb); geom.setUV2v(18,uv_front.rb); geom.setUV2v(19,uv_front.rt); // eabf
    geom.setUV2v(20,uv_back.lt); geom.setUV2v(21,uv_back.lb); geom.setUV2v(22,uv_back.rb); geom.setUV2v(23,uv_back.rt); // hdcg
    
//    for(var i=0;i<out.length;i++) geom.faceVertexUvs[0].push(out[i]);
}

    


/*
  hunit
 <----->

        B
　　　　・          ^
　　　・　・       vunit
　　・　　　・     　v
Ａ・　　　　　・C            
　・・　　　・・
　・　・　・　・
　・　　・Ｄ　・
　・　　・　　・
Ｅ・　　・　　・ G
　　・　・　・
　　　・・・
       ・
       F

       
       Dを(0,0)とする

       sideofs:側面のindex差分
 */
function createItemIsometricGeom(ind,sideind) {
    var hu=0.45, vu=0.25;
    var geom=new FaceGeometry(3*4,3*2);
    geom.setPosition(0, -hu,vu,0);//A
    geom.setPosition(1, 0,vu*2,0);//B
    geom.setPosition(2, hu,vu,0);//C
    geom.setPosition(3, 0,0,0);//D
    geom.setPosition(4, -hu,vu,0);//A
    geom.setPosition(5, -hu,-vu,0);//E
    geom.setPosition(6, 0,-vu*2,0);//F
    geom.setPosition(7, 0,0,0);//D
    geom.setPosition(8, 0,0,0);//D
    geom.setPosition(9, 0,-vu*2,0);//F
    geom.setPosition(10, hu,-vu,0);//G
    geom.setPosition(11, hu,vu,0);//C    

    geom.setFaceInds(0, 0,3,1); geom.setFaceInds(1, 1,3,2); // 上面 ADB, BDC
    geom.setFaceInds(2, 5,6,7); geom.setFaceInds(3, 4,5,7); // 左面 EFD, AED
    geom.setFaceInds(4, 8,9,10); geom.setFaceInds(5, 8,10,11);  // 右面 DFG, DGC

    var white=Color.fromCode(0xffffff), gray = Color.fromCode(0xa0a0a0), dark=Color.fromCode(0x808080);
    geom.setColor4v(0,white);geom.setColor4v(1,white);geom.setColor4v(2,white);geom.setColor4v(3,white);
    geom.setColor4v(4,gray);geom.setColor4v(5,gray);geom.setColor4v(6,gray);geom.setColor4v(7,gray);
    geom.setColor4v(8,dark);geom.setColor4v(9,dark);geom.setColor4v(10,dark);geom.setColor4v(11,dark);

    var uvrect=getUVRectFromIndex(ind);
    var uvrect_side=getUVRectFromIndex(sideind);
    geom.setUV2v(0,uvrect.lt); geom.setUV2v(1,uvrect.rt); geom.setUV2v(2,uvrect.rb); geom.setUV2v(3,uvrect.lb); //ABCD
    geom.setUV2v(4,uvrect_side.lt); geom.setUV2v(5,uvrect_side.lb); geom.setUV2v(6,uvrect_side.rb); geom.setUV2v(7,uvrect_side.rt); // AEFD
    geom.setUV2v(8,uvrect_side.lt); geom.setUV2v(9,uvrect_side.lb); geom.setUV2v(10,uvrect_side.rb); geom.setUV2v(11,uvrect_side.rt); // DFGC
    return geom;
}

function createHandBlockGeom(bt,dy) {
    var eqscl=0.2;
    var eqgeom=new FaceGeometry(6*4,6*2);
    pushBox24Verts(eqgeom,eqscl,eqscl,eqscl, 0,dy,0);
    pushBox12Faces(eqgeom);
    setFace12TopBrightColors(eqgeom);
    var inds;
    if(getItemPanelGeomType(blockTypeToItemType(bt))=="isometricside") {    
        inds=[bt-1,bt,bt+32,bt+32,bt+32,bt+32];
    } else if(bt==BT_FURNACE_COLD){
        inds=[bt+64,bt+64,bt,bt+64,bt+64,bt+64];
    } else if(bt==BT_FURNACE_BURNING){
        inds=[bt+32,bt+32,bt,bt+32,bt+32,bt+32];
    } else {
        inds=[bt,bt,bt,bt,bt,bt];
    }
    pushBoxTileDeckUV6(eqgeom,inds);
    return eqgeom;
}
function createItemPanelGeom(ind,yofs,yflip,rot,xz) {
    if(isNaN(ind))console.warn("isNaN(ind)! ",ind);
    // xy方向に256個以下のブロックを並べる
    // パネルの中央が0,0,0になるように座標を調整する
    var bsz=0.04;
    var pixels=g_base_deck.getPixelsFromIndex(ind);
    if(pixels.length!=(16*16*4)) throw ["invalid pixels:",pixels];
    //count
    var cnt=0;
    for(var y=0;y<16;y++) {
        for(var x=0;x<16;x++) {
            var pi=(x+y*16)*4;
            var r=pixels[pi], g=pixels[pi+1], b=pixels[pi+2],a=pixels[pi+3];
            if(a==0xff) cnt++;
        }
    }
    var geom=new FaceGeometry(cnt*24,cnt*12);
    var i=0;
    for(var y=0;y<16;y++) {
        for(var x=0;x<16;x++) {
            // TODO: ブロックとブロックのあいだはカリングしたらだいぶ面数が減る
            var pi=(x+y*16)*4;
            if(yflip)pi=(x+(15-y)*16)*4;
            if(rot)pi=(x*16+(15-y))*4; // 90度時計回り回転
            var r=pixels[pi], g=pixels[pi+1], b=pixels[pi+2],a=pixels[pi+3];
            if(a!=0xff) continue;
            var center;
            if(xz) {
                center=vec3.fromValues((x-8)*bsz,0,(y-8)*bsz+yofs);                
            } else {
                center=vec3.fromValues((x-8)*bsz,(y-8)*bsz+yofs,0);
            }
            pushBox24Verts(geom,bsz/2,bsz/2,bsz/2,center[0],center[1],center[2],i*24);
            pushBox12Faces(geom,i*24,i*12);
            var col=Color.fromValues(r/255.0,g/255.0,b/255.0,1);
            geom.fillColor4v(i*24,col,24);
            pushBoxTileDeckUV(geom,ATLAS_WHITE_TILE,i*24);
            i++;
        }
    }
    return geom;
}

// locはvec3じゃなくてもok
function toCellCenter(loc) {
    var x=to_i(loc.x)+0.5, y=to_i(loc.y)+0.5, z=to_i(loc.z)+0.5;
    return new Vec3(x,y,z);
}




/*
  16x16のピクセルデータから、縦短冊のポリゴン数を削減したgeometry情報(の元になる情報)を作る。
  verts, facesのobjectの配列。
 */
function makePolygonList(ind,alpha_thres) {
    if(!alpha_thres)alpha_thres=0;
    var pixels=g_base_deck.getPixelsFromIndex(ind);
    if(pixels.length!=(16*16*4)) throw ["invalid pixels:",pixels];
    
    var rects=[];

    // y=0が一番上
    for(var x=0;x<16;x++){
        var start_y=null,last_y=null;
        for(var y=0;y<16;y++) {
            var pi=(x+y*16)*4;
            var pixel=pixels[pi];
            var r=pixels[pi],g=pixels[pi+1],b=pixels[pi+2],a=pixels[pi+3];
            if(a>0) {
                if(start_y==null) {
                    start_y=y;
                }
                last_y=y;
            } else {
                if(start_y!=null) {
                    var uvrect_y0=g_base_deck.getUVOfPixel(ind,x,start_y);
                    var uvrect_y1=g_base_deck.getUVOfPixel(ind,x,last_y);
//                    console.log("makePolygonList: rect found:",x,start_y,last_y,uvrect_y0,uvrect_y1);
                    rects.push([x,start_y,last_y,uvrect_y0[0],uvrect_y0[1],uvrect_y1[2],uvrect_y1[3]]);
                    start_y=null;
                }
            }
        }
        if(last_y==15) {
            var uvrect_y0=g_base_deck.getUVOfPixel(ind,x,start_y);
            var uvrect_y1=g_base_deck.getUVOfPixel(ind,x,last_y);            
//            console.log("makePolygonList: rect-to-edge found:",x,start_y,last_y,uvrect_y0,uvrect_y1);
            rects.push([x,start_y,last_y,uvrect_y0[0],uvrect_y0[1],uvrect_y1[2],uvrect_y1[3]]);
        }
    }

    // 矩形が全部計算できたので、あとはgeomを作る
    var unit=1.0/16.0;
    var out={ panel:true, verts:[], faces:[], fvuvs:[] };    
    for(var i=0;i<rects.length;i++) {
        var r=rects[i];
        var x0=r[0]*unit, y0=r[1]*unit;
        var x1=(r[0]+1)*unit, y1=(r[2]+1)*unit;
          // 頂点は矩形1個あたり4個
        //
        //  ^ +y
        //  |
        //    3----2        
        //    |   /|
        //    |  / |        
        //    | /  |        
        //    |/   |
        //    0----1  -> +x



        out.verts.push({x:x0,y:1-y0}); // 0
        out.verts.push({x:x1,y:1-y0}); // 1
        out.verts.push({x:x1,y:1-y1}); // 2
        out.verts.push({x:x0,y:1-y1}); // 3        
        // 面は矩形1個あたり2個x2個(ウラ面)
        out.faces.push([i*4,i*4+1,i*4+2]); //012
        out.faces.push([i*4,i*4+2,i*4+3]); //023
        out.faces.push([i*4+2,i*4+1,i*4]); //210
        out.faces.push([i*4+3,i*4+2,i*4]); //320
        out.fvuvs.push([ vec2.fromValues(r[3],r[4]), vec2.fromValues(r[5],r[4]), vec2.fromValues(r[5],r[6]) ] ); // 012
        out.fvuvs.push([ vec2.fromValues(r[3],r[4]), vec2.fromValues(r[5],r[6]), vec2.fromValues(r[3],r[6]) ] ); // 023
        out.fvuvs.push([ vec2.fromValues(r[5],r[6]), vec2.fromValues(r[5],r[4]), vec2.fromValues(r[3],r[4]) ] ); // 210
        out.fvuvs.push([ vec2.fromValues(r[3],r[6]), vec2.fromValues(r[5],r[6]), vec2.fromValues(r[3],r[4]) ] ); // 320       
    }
    return out;
    
}

function splitArray(ary,unitsize) {
    var out=[];
    for(var i=0;;i++) {
        var start_ind=i*unitsize;
        var end_ind=(i+1)*unitsize;
        var to_break=false;
        if( end_ind >= ary.length ){
            end_ind=ary.length;
            to_break=true;
        }
        out.push( ary.slice(start_ind, end_ind) );
        if( to_break ) break;
    }
    return out;
}

function secToHumanReadable(sec) {
    var min=to_i(sec/60);
    var sec=sec%60;
    if(sec<10)sec="0"+sec;
    return ""+min+":"+sec;
}

function str2UTF8(str){
    var n = str.length,
        idx = -1,
        byteLength = 512,
        bytes = new Uint8Array(byteLength),
        i, c, _bytes;

    for(i = 0; i < n; ++i){
        c = str.charCodeAt(i);
        if(c <= 0x7F){
            bytes[++idx] = c;
        } else if(c <= 0x7FF){
            bytes[++idx] = 0xC0 | (c >>> 6);
            bytes[++idx] = 0x80 | (c & 0x3F);
        } else if(c <= 0xFFFF){
            bytes[++idx] = 0xE0 | (c >>> 12);
            bytes[++idx] = 0x80 | ((c >>> 6) & 0x3F);
            bytes[++idx] = 0x80 | (c & 0x3F);
        } else {
            bytes[++idx] = 0xF0 | (c >>> 18);
            bytes[++idx] = 0x80 | ((c >>> 12) & 0x3F);
            bytes[++idx] = 0x80 | ((c >>> 6) & 0x3F);
            bytes[++idx] = 0x80 | (c & 0x3F);
        }
        //倍々でメモリを確保していく
        if(byteLength - idx <= 4){
            _bytes = bytes;
            byteLength *= 2;
            bytes = new Uint8Array(byteLength);
            bytes.set(_bytes);
        }
    }
    return bytes.subarray(0, ++idx);
}

