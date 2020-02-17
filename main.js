to_i=Math.floor;
//

var g_stop_render=false;
function stopRender() {
    g_stop_render = true;
}

var g_fullscreen=false;

function makeFullscreen() {
    var doc = window.document;
    var docEl = doc.documentElement;
    var requestFullScreen = docEl.requestFullscreen || docEl.requestFullScreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
    g_fullscreen=true;
    var scr=document.getElementById("screen");
    window.onresize=onResizeWindow;
    requestFullScreen.call(scr);
}


document.addEventListener("keydown", function(e) {
    if(e.code == "Space") e.preventDefault();
});
document.getElementById("screen").addEventListener("mousedown", function(e) {
    pointerLock();
});
document.addEventListener("mousedown", function(e) {
    if(g_cursor_prop.cursor_hit_pos) {
//        console.log("hpos:",g_cursor_prop.cursor_hit_pos, g_cursor_prop.cursor_hit_norm);        
        if(g_cur_tool == TOOL_BLOCK) {
            if(g_cursor_prop.cursor_hit_pos && g_cursor_prop.cursor_hit_norm ) {
                var x=to_i(g_cursor_prop.cursor_hit_pos[0]+g_cursor_prop.cursor_hit_norm[0]*0.5);
                var y=to_i(g_cursor_prop.cursor_hit_pos[1]+g_cursor_prop.cursor_hit_norm[1]*0.5);
                var z=to_i(g_cursor_prop.cursor_hit_pos[2]+g_cursor_prop.cursor_hit_norm[2]*0.5);
                var col=vec4.fromValues(1,1,1,1);//range(0.3,1.0),range(0.3,1.0),range(0.3,1.0),1.0);
                putBlock(x,y,z,SHAPE_CUBE,col);
            }
        } else if(g_cur_tool == TOOL_REMOVE) {
            if(g_cursor_prop.cursor_hit_pos) {
                var x=to_i(g_cursor_prop.cursor_hit_block_pos[0]);
                var y=to_i(g_cursor_prop.cursor_hit_block_pos[1]);
                var z=to_i(g_cursor_prop.cursor_hit_block_pos[2]);
                removeBlock(x,y,z);
            }
        } else if(g_cur_tool == TOOL_PENCIL) {
            if(g_cursor_prop.cursor_hit_block_pos && g_cursor_prop.cursor_hit_norm ) {
                var x=to_i(g_cursor_prop.cursor_hit_block_pos[0]);
                var y=to_i(g_cursor_prop.cursor_hit_block_pos[1]);
                var z=to_i(g_cursor_prop.cursor_hit_block_pos[2]);
                var blk = findBlock(x,y,z);
                if(!blk) console.error("blk must not null");
                
                var vv=getVertSet8(blk);
                console.log("BLK:",blk,vv,g_cursor_prop.cursor_hit_norm);

                // 全部の面について調べるか。
                for(var i=0;i<vv.num_face;i++) {
                    var face = vv.faces[i];
                    var t={};
                    t.a=vv.positions[vv.faces[i][0]];
                    t.b=vv.positions[vv.faces[i][1]];
                    t.c=vv.positions[vv.faces[i][2]];
                    var p=getPointOnFace(g_cursor_prop.simray,t);
                    if(!p) continue;
                    
                    var uv_a=vv.uvs[vv.faces[i][0]];
                    var uv_b=vv.uvs[vv.faces[i][1]];
                    var uv_c=vv.uvs[vv.faces[i][2]];
                    var uv_ab=vec2.fromValues(uv_b[0]-uv_a[0],uv_b[1]-uv_a[1]);
                    var uv_ac=vec2.fromValues(uv_c[0]-uv_a[0],uv_c[1]-uv_a[1]);
                    var uv_pos=vec2.fromValues(uv_a[0]+uv_ab[0]*p.s+uv_ac[0]*p.t,
                                               uv_a[1]+uv_ab[1]*p.s+uv_ac[1]*p.t);
                    var pix_x = to_i(uv_pos[0]*256);
                    var pix_y = to_i(uv_pos[1]*256);
                    g_model_img.setPixel(pix_x,pix_y,Color.fromValues(1,1,1,1));
                    g_model_tex.setMoyaiImage(g_model_img);
                    console.log("hoge",uv_ab,uv_ac,uv_a,uv_pos,pix_x,pix_y);
                }                    
            }
        }
    }
});



function pointerLock() {
    var body = document.body;
    body.requestPointerLock = body.requestPointerLock || body.mozRequestPointerLock || body.webkitRequestPointerLock;
    body.requestPointerLock();
    g_pointer_lock_at=now();
    document.getElementById("screen").style="cursor:none;";
}
function pointerUnlock() {
    document.exitPointerLock = document.exitPointerLock    || document.mozExitPointerLock;
    document.exitPointerLock();
    
}
var g_pointer_locked;
document.onpointerlockchange=function(event) {
    if(document.pointerLockElement) {
        g_pointer_locked=true;
    } else {
        g_pointer_locked=false;
        var elem=document.getElementById("screen");
        if(elem)elem.style="cursor:default;";    
    }
}


function onResizeWindow() {
    var w=window.innerWidth, h=window.innerHeight;
    updateWindowSize(w,h);
}

function updateWindowSize(w,h){
    window.onresize=null;
    g_viewport3d.screen_width=w;
    g_viewport3d.screen_height=h;
    g_viewport2d.screen_width=w;
    g_viewport2d.screen_height=h;
    Moyai.width=w;
    Moyai.height=h;

//    Moyai.canvas.width=w;
//    g_moyai_client.renderer.domElement.height=h;
//    g_moyai_client.renderer.domElement.style="width:"+w+"px;height:"+w+"px;";
//    g_moyai_client.renderer.setSize(w,h);
}






////////////
var SCRW=window.innerWidth, SCRH=window.innerHeight;
var pixelRatio = window.devicePixelRatio || 1;
SCRW*=pixelRatio;
SCRH*=pixelRatio;
console.log("Screen size:",SCRW,SCRH);
Moyai.init(SCRW,SCRH);
Moyai.clearColor=Color.fromValues(0.5,0.5,0.5,1);
var screen = document.getElementById("screen");
var canvas=Moyai.getDomElement();
canvas.style="width:100%; height:100%;";
screen.appendChild(canvas);


var g_keyboard = new Keyboard();
g_keyboard.setupBrowser(window);
g_keyboard.preventDefault=true;
var g_mouse = new Mouse();
g_mouse.setupBrowser(window,screen);


var g_viewport3d = new Viewport();
g_viewport3d.setSize(SCRW,SCRH);
g_viewport3d.setClip3D( 0.01, 100 );

var g_viewport2d = new Viewport();
g_viewport2d.setSize(SCRW,SCRH);
g_viewport2d.setScale2D(SCRW,SCRH);

var g_main_layer = new Layer();
Moyai.insertLayer(g_main_layer);
g_main_layer.setViewport(g_viewport3d);

var g_main_camera = new PerspectiveCamera( 45*Math.PI/180 , SCRW / SCRH , 0.1, 1000);
g_main_camera.setLoc(-5,5,0);
g_main_camera.setLookAt(vec3.fromValues(0,0,0), vec3.fromValues(0,1,0));
g_main_layer.setCamera(g_main_camera);
g_main_camera.vel = vec3.fromValues(0,0,0);
g_main_camera.nose = vec3.fromValues(0,0,0);
g_main_camera.flying=false;

var g_hud_camera = new OrthographicCamera(-SCRW/2,SCRW/2,SCRH/2,-SCRH/2);
g_hud_camera.setLoc(0,0);

var g_hud_layer = new Layer();
Moyai.insertLayer(g_hud_layer);
g_hud_layer.setViewport(g_viewport2d);
g_hud_layer.setCamera( g_hud_camera );

var g_atlas_tex = new Texture();
g_atlas_tex.loadPNG( "./atlas.png", 256,256 );
//g_base_tex.min_filter=Moyai.gl.NEAREST_MIPMAP_NEAREST;  almost no perfomance improvement
var g_atlas_deck = new TileDeck();
g_atlas_deck.setTexture(g_atlas_tex);
g_atlas_deck.setSize(16,16,16,16);

var g_model_img = new MoyaiImage();
//g_model_img.setSize(256,256);
g_model_img.loadPNG("./modeltex.png",256,256);


var g_model_tex = new Texture();
g_model_img.onload = function() {
    g_model_tex.setMoyaiImage(g_model_img);
}
//g_model_tex.loadPNG("./modeltex.png",256,256);


var g_model_deck = new TileDeck();
g_model_deck.setTexture(g_model_tex);
g_model_deck.setSize(16,16,16,16);

////////////////////////

// model texture UVs allocation
var g_uv_alloc_table = new Int32Array(16*16); 
for(var i in g_uv_alloc_table) g_uv_alloc_table[i]=-1;
function allocateUVIndex() {
    for(var i in g_uv_alloc_table) {
        if(g_uv_alloc_table[i]<0) {
            g_uv_alloc_table[i]=1;
            console.log("allocateUVIndex: found:",i);
            return i;
        }
    }
    console.error("allocateUVIndex: full!");
    return undefined;
}
function freeUVIndex(ind) {
    if(ind===undefined || ind==null) return;
    ind|=0;
    if(ind<0||ind>=g_uv_alloc_table.length) {
        console.error("freeUVIndex: invalid ind:",ind);
        return;
    }
    g_uv_alloc_table[ind]=-1;
}

////////////////////////

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

//   +y
//    ^
//                     d,d,-d
//     H ------------- G
//    /|              /|
//   / |             / |
//  E ------------- F  |
//  |  |            |  |      -z               7   6
//  |  |            |  |      /               4   5
//  |  D -----------|- C
//  | /             | /
//  |/              |/                         3   2
//  A ------------- B     >   +x              0   1
//  -d,-d,d
function getVertSet8(blk) {
    var x=blk.x, y=blk.y, z=blk.z;
    var out={};
    if(blk.shape==SHAPE_CUBE) {
        var a=out.a=vec3.fromValues(0+x,0+y,1+z);
        var b=out.b=vec3.fromValues(1+x,0+y,1+z);
        var c=out.c=vec3.fromValues(1+x,0+y,0+z);
        var d=out.d=vec3.fromValues(0+x,0+y,0+z);
        var e=out.e=vec3.fromValues(0+x,1+y,1+z);
        var f=out.f=vec3.fromValues(1+x,1+y,1+z);
        var g=out.g=vec3.fromValues(1+x,1+y,0+z);
        var h=out.h=vec3.fromValues(0+x,1+y,0+z);

        out.num_vert=24;
        out.num_face=12;
        
        out.positions = [
            a,b,c,d, // -y
            e,f,g,h, // +y
            a,b,f,e, // +z
            c,d,h,g, // -z
            b,c,g,f, // +x
            d,a,e,h, // -x
        ];
        
        var uvary = new Float32Array(4);
        g_atlas_deck.getUVFromIndex(uvary,blk.uvind_xp,0,0,0);
        out.uv_xp_lt=vec2.fromValues(uvary[0],uvary[1]);
        out.uv_xp_rt=vec2.fromValues(uvary[2],uvary[1]);
        out.uv_xp_lb=vec2.fromValues(uvary[0],uvary[3]);
        out.uv_xp_rb=vec2.fromValues(uvary[2],uvary[3]);
        g_atlas_deck.getUVFromIndex(uvary,blk.uvind_xn,0,0,0);
        out.uv_xn_lt=vec2.fromValues(uvary[0],uvary[1]);
        out.uv_xn_rt=vec2.fromValues(uvary[2],uvary[1]);
        out.uv_xn_lb=vec2.fromValues(uvary[0],uvary[3]);
        out.uv_xn_rb=vec2.fromValues(uvary[2],uvary[3]);
        g_atlas_deck.getUVFromIndex(uvary,blk.uvind_yp,0,0,0);        
        out.uv_yp_lt=vec2.fromValues(uvary[0],uvary[1]);
        out.uv_yp_rt=vec2.fromValues(uvary[2],uvary[1]);
        out.uv_yp_lb=vec2.fromValues(uvary[0],uvary[3]);
        out.uv_yp_rb=vec2.fromValues(uvary[2],uvary[3]);
        g_atlas_deck.getUVFromIndex(uvary,blk.uvind_yn,0,0,0);        
        out.uv_yn_lt=vec2.fromValues(uvary[0],uvary[1]);
        out.uv_yn_rt=vec2.fromValues(uvary[2],uvary[1]);
        out.uv_yn_lb=vec2.fromValues(uvary[0],uvary[3]);
        out.uv_yn_rb=vec2.fromValues(uvary[2],uvary[3]);
        g_atlas_deck.getUVFromIndex(uvary,blk.uvind_zp,0,0,0);        
        out.uv_zp_lt=vec2.fromValues(uvary[0],uvary[1]);
        out.uv_zp_rt=vec2.fromValues(uvary[2],uvary[1]);
        out.uv_zp_lb=vec2.fromValues(uvary[0],uvary[3]);
        out.uv_zp_rb=vec2.fromValues(uvary[2],uvary[3]);                        
        g_atlas_deck.getUVFromIndex(uvary,blk.uvind_zn,0,0,0);        
        out.uv_zn_lt=vec2.fromValues(uvary[0],uvary[1]);
        out.uv_zn_rt=vec2.fromValues(uvary[2],uvary[1]);
        out.uv_zn_lb=vec2.fromValues(uvary[0],uvary[3]);
        out.uv_zn_rb=vec2.fromValues(uvary[2],uvary[3]);

        out.uvs = [
            out.uv_yn_lb, out.uv_yn_rb, out.uv_yn_rt, out.uv_yn_lt, // abcd
            out.uv_yp_lb, out.uv_yp_rb, out.uv_yp_rt, out.uv_yp_lt, // efgh
            out.uv_zp_lb, out.uv_zp_rb, out.uv_zp_rt, out.uv_zp_lt, // abfe
            out.uv_zn_lb, out.uv_zn_rb, out.uv_zn_rt, out.uv_zn_lt, // cdhg
            out.uv_xp_lb, out.uv_xp_rb, out.uv_xp_rt, out.uv_xp_lt, // bcgf
            out.uv_xn_lb, out.uv_xn_rb, out.uv_xn_rt, out.uv_xn_lt, // daeh
        ];

        
        var col=blk.color;
        out.ypcol=vec4.clone(col);
        out.xncol=vec4.fromValues(col[0]*0.8,col[1]*0.8,col[2]*0.8,1);
        out.zncol=vec4.fromValues(col[0]*0.7,col[1]*0.7,col[2]*0.7,1);
        out.xpcol=vec4.fromValues(col[0]*0.6,col[1]*0.6,col[2]*0.6,1);
        out.zpcol=vec4.fromValues(col[0]*0.5,col[1]*0.5,col[2]*0.5,1);                        
        out.yncol=vec4.fromValues(col[0]*0.4,col[1]*0.4,col[2]*0.4,1);

        out.colors = [
            out.yncol,out.yncol,out.yncol,out.yncol,
            out.ypcol,out.ypcol,out.ypcol,out.ypcol,
            out.zpcol,out.zpcol,out.zpcol,out.zpcol,
            out.zncol,out.zncol,out.zncol,out.zncol,
            out.xpcol,out.xpcol,out.xpcol,out.xpcol,
            out.xncol,out.xncol,out.xncol,out.xncol,
        ];

        out.face_yn_0 = [0,3,1]; // ADB
        out.face_yn_1 = [3,2,1]; // DCB
        out.face_yp_0 = [7,5,6]; // HFG
        out.face_yp_1 = [4,5,7]; // EFH
        out.face_zp_0 = [8,9,10]; // ABF
        out.face_zp_1 = [8,10,11]; // AFE
        out.face_zn_0 = [12,13,14]; // CDH
        out.face_zn_1 = [12,14,15]; // CHG
        out.face_xp_0 = [16,17,18]; // BCG
        out.face_xp_1 = [16,18,19]; // BGF
        out.face_xn_0 = [20,21,22]; // DAE
        out.face_xn_1 = [20,22,23]; // DEH
        out.faces = [
            out.face_yn_0, out.face_yn_1,
            out.face_yp_0, out.face_yp_1,
            out.face_zp_0, out.face_zp_1,
            out.face_zn_0, out.face_zn_1,
            out.face_xp_0, out.face_xp_1,
            out.face_xn_0, out.face_xn_1,
        ];
    }
    return out;
}
//////////////////
var SHAPE_CUBE = 0;
var IDX_GROUND=0;
var IDX_CROSS=1;

var g_chunk_id_gen=1;

class Chunk extends Prop3D {
    // 巨大な地形を表現する必要がないので、3次元配列ボクセルじゃなくて、単純な配列にしておく
    // コリジョンも地面だけでいい気がしてきた.
    constructor(tex) {
        super();
        this.blocks=[];

        this.enable_frustum_culling = false;
        this.setMaterial(g_colshader);
        this.setTexture(tex);
        this.setScl(1,1,1);
        this.setLoc(0,0,0);
        this.setColor(vec4.fromValues(1,1,1,1));

        this.chunk_id = g_chunk_id_gen;
        g_chunk_id_gen++;
    }
    findBlock(ix,iy,iz) {
        ix=to_i(ix);
        iy=to_i(iy);
        iz=to_i(iz);
        for(var i in this.blocks) {
            var b=this.blocks[i];
            if(b.x==ix && b.y==iy && b.z==iz) return i;
        }
        return -1;
    }
    setBlock(ix,iy,iz,shapeid,col4,dkind) {
//        if(dkind===undefined) console.log("CHKSETBLOCK:",ix,iy,iz,"sh:",shapeid,"col:",col4,"dkind:",dkind);
        ix=to_i(ix);
        iy=to_i(iy);
        iz=to_i(iz);        
        var block={x:ix,y:iy,z:iz,shape:shapeid,color:col4,chunk_id:this.chunk_id};                
        var ind = this.findBlock(ix,iy,iz);
        if(ind>=0) {
            this.blocks[ind] = block;
        } else {
            this.blocks.push(block);
        }
        if(dkind===undefined) {
            if(shapeid!=SHAPE_CUBE) console.error("not impl");
            var xpb=this.findBlock(ix+1,iy,iz);
            if(xpb<0) block.uvind_xp=allocateUVIndex();
            var xnb=this.findBlock(ix-1,iy,iz);
            if(xnb<0) block.uvind_xn=allocateUVIndex();
            var ypb=this.findBlock(ix,iy+1,iz);
            if(ypb<0) block.uvind_yp=allocateUVIndex();
            var ynb=this.findBlock(ix,iy-1,iz);
            if(ynb<0) block.uvind_yn=allocateUVIndex();
            var zpb=this.findBlock(ix,iy,iz+1);
            if(zpb<0) block.uvind_zp=allocateUVIndex();
            var znb=this.findBlock(ix,iy,iz-1);
            if(znb<0) block.uvind_zn=allocateUVIndex();
        } else {
            block.uvind_xp=block.uvind_xn=block.uvind_yp=block.uvind_yn=block.uvind_zp=block.uvind_zn=dkind;
        }
    }
    removeBlock(ix,iy,iz) {
        for(var i in this.blocks) {
            var b=this.blocks[i];
            if(b.x==ix && b.y==iy && b.z==iz) {
                this.blocks.splice(i,1);
                freeUVIndex(b.uvind_xp);
                freeUVIndex(b.uvind_xn);
                freeUVIndex(b.uvind_yp);
                freeUVIndex(b.uvind_yn);
                freeUVIndex(b.uvind_zp);
                freeUVIndex(b.uvind_zn);                
                console.log("removeBlock: done,",ix,iy,iz);
                return true;
            }
        }
        console.log("removeBlock: not found: ",ix,iy,iz);
        return false;
    }
    updateMesh() {
        // block count
        var num_block = this.blocks.length;
        // vert count
        var num_vert = num_block * 6*4;
        // face count
        var num_face = num_block * 6*2;
        var geom = new FaceGeometry(num_vert,num_face);



        // 
        //
        //   +y
        //    ^
        //                     d,d,-d
        //     H ------------- G
        //    /|              /|
        //   / |             / |
        //  E ------------- F  |
        //  |  |            |  |      -z               7   6
        //  |  |            |  |      /               4   5
        //  |  D -----------|- C
        //  | /             | /
        //  |/              |/                         3   2
        //  A ------------- B     >   +x              0   1
        //  -d,-d,d
        
        var vi=0,fi=0;
        for(var bi=0;bi<num_block;bi++) {
            var block=this.blocks[bi];
            // 0,0,0のブロック基準点は(0,0,0)にあるようにする
            var vv=getVertSet8(block);
            for(var i=0;i<vv.num_vert;i++) geom.setPosition3v(i+vi,vv.positions[i]);
            for(var i=0;i<vv.num_vert;i++) geom.setUV2v(i+vi,vv.uvs[i]);
            for(var i=0;i<vv.num_vert;i++) geom.setColor4v(i+vi,vv.colors[i]);
            for(var i=0;i<vv.num_face;i++) geom.setFaceInds(i+fi,vv.faces[i][0]+vi, vv.faces[i][1]+vi,vv.faces[i][2]+vi);
            
            vi+=vv.num_vert;
            fi+=vv.num_face;
        }
//        console.log("updateMesh: geom:",geom);
        this.setGeom(geom);    // TODO: dispose older one     
    }
};


////////////////////

var g_chunks=[];
function findBlock(x,y,z) {
    for(var i in g_chunks) {
        var chk=g_chunks[i];
        var ind = chk.findBlock(x,y,z);
        if(ind>=0) return chk.blocks[ind];
    }
    return null;
}


///////////////

var g_colshader = new DefaultColorShaderMaterial();

function createGroundChunk(x0,z0,x1,z1) {
    var chk=new Chunk(g_atlas_tex);
    for(var z=z0;z<=z1;z++) {
        for(var x=x0;x<=x1;x++) {
            var r=1;
            if((x+z)%2==0) r=0.8;
            var col=vec4.fromValues(0.2*r,0.2*r,0.2*r,1);
            chk.setBlock(x,-1,z,SHAPE_CUBE,col,IDX_GROUND);
        }
    }
    chk.updateMesh();
    g_main_layer.insertProp(chk);
    g_chunks.push(chk);
    return chk;
}
var g_ground_sz=20;
var g_ground_chk=createGroundChunk(-g_ground_sz,-g_ground_sz,g_ground_sz,g_ground_sz);

function getBlockAround6(x,y,z) {
    return [ findBlock(x+1,y,z), findBlock(x-1,y,z),
            findBlock(x,y+1,z), findBlock(x,y-1,z),
            findBlock(x,y,z+1), findBlock(x,y,z-1) ];
}
function findChunkById(id) {
    for(var i in g_chunks) {
        if(g_chunks[i].chunk_id==id) return g_chunks[i];
    }
    return null;
}
function findChunkAt(x,y,z) {
    // check around-6, add when found, otherwise create new chunk
    var blks = getBlockAround6(x,y,z);
    var blk_found;
    for(var i=0;i<6;i++) {
        if(blks[i] && blks[i].chunk_id != g_ground_chk.chunk_id ) {
            blk_found=blks[i];
            break;
        }
    }
    if(!blk_found) return null;
    return findChunkById(blk_found.chunk_id);        
}
function putBlock(x,y,z,shape,col,dkind) {
    var chk = findChunkAt(x,y,z);
    if(chk) {
        chk.setBlock(x,y,z,shape,col,dkind);
        chk.updateMesh();
    } else {
        createNewChunk(x,y,z,shape,col,dkind);        
    }
}

function createNewChunk(x,y,z,shape,col,dkind) {
    var chk=new Chunk(g_model_tex);
    chk.setBlock(x,y,z,shape,col,dkind);
    chk.updateMesh();
    g_main_layer.insertProp(chk);
    g_chunks.push(chk);
    console.log("Created new chunk:",chk.chunk_id);
    return chk;
}

function removeBlock(x,y,z) {
    var blk=findBlock(x,y,z);
    if(!blk) {
        console.log("no block at ",x,y,z);
        return;
    }
    var chk=findChunkById(blk.chunk_id);
    if(!chk) {
        console.error("chk must be found");
        return;
    }
    if(chk.removeBlock(x,y,z)) {
        chk.updateMesh();
    }
}


// https://vorg.github.io/pex/docs/pex-geom/Ray.html
function getPointOnFace(ray,triangle) {
    var EPS=0.0000001;
    var u=vec3.create();
    var v=vec3.create();    
    vec3.subtract(u,triangle.b,triangle.a);
    vec3.subtract(v,triangle.c,triangle.a);
    var n=vec3.create();
    vec3.cross(n,u,v);
    if(vec3.length(n)<EPS) {
        console.log("getPointOnFace ret -1");
        return null;
    }

    var w0=vec3.create();
    vec3.subtract(w0,ray.orig,triangle.a);

    var a=-vec3.dot(n,w0);
    var b=vec3.dot(n,ray.dir);
    if(Math.abs(b)<EPS) {
        console.log("getPointOnFace ret -2 or -3");        
        if(a==0) return null;
        else return null;
    }
    var r=a/b;
    if(r<-EPS) {
        console.log("getPointOnFace ret -4");
        return null;
    }
    // intersect point on the plane
    var I=vec3.fromValues( ray.orig[0] + r * ray.dir[0],
                           ray.orig[1] + r * ray.dir[1],
                           ray.orig[2] + r * ray.dir[2] ); 

    var uu=vec3.dot(u,u);
    var uv=vec3.dot(u,v);
    var vv=vec3.dot(v,v);
    var w=vec3.create();
    vec3.subtract(w,I,triangle.a);

    var wu=vec3.dot(w,u);
    var wv=vec3.dot(w,v);
    var D=uv*uv-uu*vv;
    var s=(uv*wv-vv*wu)/D;
    if(s<-EPS || s>1.0+EPS) {
        console.log("getPointOnFace ret -5");
        return null;
    }
    var t=(uv*wu-uu*wv)/D;
    if(t<-EPS||(s+t)>1.0+EPS) {
        console.log("getPointOnFace ret -6");
        return null;
    }

    var outpos=vec3.fromValues(
        triangle.a[0] + u[0]*s + v[0]*t,
        triangle.a[1] + u[1]*s + v[1]*t,
        triangle.a[2] + u[2]*s + v[2]*t
    );
    var out = { u:u, v:v, s:s, t:t, pos:outpos };    
    console.log("getPointOnFace:",u,v,s,t,out);
    return out;
}



/////////////////
/////////////////

// cursor


var linemat=new PrimColorShaderMaterial();
var linegeom = new LineGeometry(24,12);
setLineBoxGeom(linegeom,0.505,0.505,0.505,WHITE);

var g_cursor_prop = new Prop3D();
g_cursor_prop.setGeom(linegeom);
g_cursor_prop.setMaterial(linemat);
g_main_layer.insertProp(g_cursor_prop);
g_cursor_prop.setBlockLoc = function(x,y,z) {
    this.setScl(1.0001,1.0001,1.0001); // 1.0で問題ないはずなのに、ちょっと大きくしないとブロックの中に隠れるようになってしまう。。    
    this.setLoc(Math.floor(x)+0.5,Math.floor(y)+0.5,Math.floor(z)+0.5);
}
g_cursor_prop.setBoundsLoc = function(minv,maxv) {
    var sx=maxv[0]-minv[0], sy=maxv[1]-minv[1], sz=maxv[2]-minv[2];
    this.setScl(sx,sy,sz);
    var d=vec3.fromValues(sx/2,sy/2,sz/2);
    this.setLoc(minv[0]+d[0],minv[1]+d[1],minv[2]+d[2]);
}


g_cursor_prop.prop3DPoll = function(dt) {
    var find_fluid=false;
    var find_spore=false;    


    var cam=g_main_camera.loc;
    var nose = g_main_camera.nose;
    if(!this.dir)this.dir=vec3.create();
    vec3.set(this.dir, nose[0]-cam[0], nose[1]-cam[1], nose[2]-cam[2]);
    if(!this.simray) this.simray=new SimpleRay();
    this.simray.update(cam,this.dir);
    var simray = this.simray;
    var hitpos=[], hitnorm=[], blockpos=[];
    var last_hit_pos;
    
    traceVoxelRay( function(x,y,z) {
        if(x<-g_ground_sz || z<-g_ground_sz || x>g_ground_sz || z>g_ground_sz)return false;
        if(findBlock(x,y,z)) {
            blockpos[0]=x; blockpos[1]=y; blockpos[2]=z;
            return true;
        }
        return false;
    }, cam, this.dir, 15, hitpos, hitnorm );
    var hx=Math.floor(hitpos[0]),hy=Math.floor(hitpos[1]),hz=Math.floor(hitpos[2]);
    if(hitnorm[0]!=0) {
        if(hitnorm[0]==1) hx=hitpos[0]-hitnorm[0]; else hx=hitpos[0];
    } else if(hitnorm[1]!=0) {
        if(hitnorm[1]==1) hy=hitpos[1]-hitnorm[1]; else hy=hitpos[1];
    } else if(hitnorm[2]!=0) {
        if(hitnorm[2]==1) hz=hitpos[2]-hitnorm[2]; else hz=hitpos[2];
    } else {
        //nohit
        this.setVisible(false);
        this.cursor_hit_norm=null;
        return true;
    }

    // カーソル見えてる
    this.setVisible(true);
    this.cursor_hit_norm=hitnorm;
    this.cursor_hit_pos=hitpos;
    this.cursor_hit_block_pos=blockpos;
    this.setBlockLoc(hx,hy,hz);


    return true;
}

///////////////////
var g_cross_prop = new Prop2D();
g_cross_prop.setDeck(g_atlas_deck);
g_cross_prop.setIndex(IDX_CROSS);
g_cross_prop.setScl(32);
g_cross_prop.setLoc(0,0);
g_cross_prop.setColor(Color.fromValues(1,1,1,0.7));
g_hud_layer.insertProp(g_cross_prop);


///////////////////////////////
TOOL_BLOCK=1;
TOOL_REMOVE=2;
TOOL_PENCIL=3;

var g_cur_tool;
function setTool(t) {
    g_cur_tool= t;
    var nm="unknown";
    if(t==TOOL_BLOCK) nm = "Block";
    else if(t==TOOL_PENCIL) nm="Pencil";
    else if(t==TOOL_REMOVE) nm="Remove";
    document.getElementById("tool").innerHTML="Tool: " + nm;
}
setTool(TOOL_BLOCK);

///////////////////////////////
function tangentMax(theta,absmax) {
    var cs=Math.cos(theta);
    var sn=Math.sin(theta);
    if(cs==0) {
        if(theta>0)return absmax; else return -absmax;
    } else {
        return Math.tan(theta);
    }
}


var last_anim_at = new Date().getTime();
var last_print_at = new Date().getTime();
var fps=0;
var started_at=now();
var pitch=0, yaw=0;
function animate() {
    if(!g_stop_render) requestAnimationFrame(animate);

    fps++;

    var now_time = new Date().getTime();
    var dt = (now_time - last_anim_at) / 1000.0;

    if(now_time > last_print_at+1000) {
        last_print_at=now_time;
        document.getElementById("status").innerHTML = "FPS:"+fps+ " props:" + g_main_layer.props.length + " draw3d:" + Moyai.draw_count_3d + " skip3d:" + Moyai.skip_count_3d + " loc:" + g_main_camera.loc + " chk:" + g_chunks.length;
        fps=0;
    }

    if(g_main_camera) {
        var t=now()-started_at;
        var gravity = -10;
        if(g_main_camera.flying) {
            gravity=0;
        } 
        g_main_camera.vel[1] += gravity * dt;        
        var nextloc = vec3.clone(g_main_camera.loc);
        nextloc[0]+=g_main_camera.vel[0] * dt;
        nextloc[1]+=g_main_camera.vel[1] * dt;
        nextloc[2]+=g_main_camera.vel[2] * dt;
        if(nextloc[0]<-g_ground_sz) nextloc[0]=-g_ground_sz;
        if(nextloc[0]>g_ground_sz) nextloc[0]=g_ground_sz;
        if(nextloc[2]<-g_ground_sz) nextloc[2]=-g_ground_sz;
        if(nextloc[2]>g_ground_sz) nextloc[2]=g_ground_sz;
        if(nextloc[1]<1) {
            nextloc[1]=1;
            g_main_camera.vel[1]=0;
        }
        vec3.set(g_main_camera.loc,nextloc[0],nextloc[1],nextloc[2]);

        var front=0,side=0;
        if(g_keyboard) {
            if(g_keyboard.getKey('1')) setTool(TOOL_BLOCK);
            if(g_keyboard.getKey('2')) setTool(TOOL_REMOVE);
            if(g_keyboard.getKey('3')) setTool(TOOL_PENCIL);            
            if(g_keyboard.getKey('a')) side-=1;
            if(g_keyboard.getKey('d')) side+=1;
            if(g_keyboard.getKey('w')) front+=1;
            if(g_keyboard.getKey('s')) front-=1;
            if(g_keyboard.getKey('Escape')) pointerUnlock();
            if(g_keyboard.getKey(' ')) {
                g_main_camera.vel[1]=3;
                var t=now();
                if(g_main_camera.jump_at && g_main_camera.last_jump_key==false) {
                    var dt=t-g_main_camera.jump_at;
                    if(dt<0.3) {
                        g_main_camera.flying= !g_main_camera.flying;
                    }
                }
                if(g_main_camera.flying) {
                    if(g_keyboard.mod_shift) {
                        g_main_camera.vel[1]=-2;
                    } else {
                        g_main_camera.vel[1]=2;                        
                    }
                }
                g_main_camera.jump_at=now();
                g_main_camera.last_jump_key=true;
            } else {
                g_main_camera.last_jump_key=false;
                if(g_main_camera.flying) {
                    g_main_camera.vel[1]=0;
                }
            }
        }
        
        if(g_mouse) {
            var dx=g_mouse.movement[0];
            var dy=g_mouse.movement[1];
            g_mouse.clearMovement();
            yaw-=dy/250;
            if(yaw>Math.PI/2) yaw=Math.PI/2;
            if(yaw<-Math.PI/2) yaw=-Math.PI/2;
            pitch+=dx/250;

            g_main_camera.vel[0]*=0.92;
            g_main_camera.vel[2]*=0.92;            

            var side_pitch=pitch;
            if(side<0) side_pitch=pitch-Math.PI/2;
            else if(side>0)side_pitch=pitch+Math.PI/2;
            
            var k=1;
            g_main_camera.vel[0]+=Math.cos(pitch)*k*front + Math.cos(side_pitch)*k*Math.abs(side);
            g_main_camera.vel[2]+=Math.sin(pitch)*k*front + Math.sin(side_pitch)*k*Math.abs(side);

            g_main_camera.nose = vec3.fromValues( g_main_camera.loc[0] + 1.0 * Math.cos(pitch),
                                                  g_main_camera.loc[1] + tangentMax(yaw),
                                                  g_main_camera.loc[2] + 1.0 * Math.sin(pitch) );


            g_main_camera.setLookAt(g_main_camera.nose, vec3.fromValues(0,1,0));            
        }
    }
    
    
    last_anim_at = now_time;    
    Moyai.poll(dt);
    Moyai.render();
}

animate();

