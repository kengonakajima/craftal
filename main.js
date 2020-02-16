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
            if(g_cursor_prop.cursor_hit_pos) {
                var x=to_i(g_cursor_prop.cursor_hit_pos[0]+g_cursor_prop.cursor_hit_norm[0]*0.5);
                var y=to_i(g_cursor_prop.cursor_hit_pos[1]+g_cursor_prop.cursor_hit_norm[1]*0.5);
                var z=to_i(g_cursor_prop.cursor_hit_pos[2]+g_cursor_prop.cursor_hit_norm[2]*0.5);
                var col=vec4.fromValues(1,1,1,1);//range(0.3,1.0),range(0.3,1.0),range(0.3,1.0),1.0);
                putBlock(x,y,z,SHAPE_CUBE,irange(0,8)+1,col);
            }
        } else if(g_cur_tool == TOOL_PENCIL) {
            if(g_cursor_prop.cursor_hit_block_pos) {
                var x=to_i(g_cursor_prop.cursor_hit_block_pos[0]);
                var y=to_i(g_cursor_prop.cursor_hit_block_pos[1]);
                var z=to_i(g_cursor_prop.cursor_hit_block_pos[2]);
                var blk = findBlock(x,y,z);
                var vv=getVertSet8(blk);
                console.log("BLK:",blk,vv);
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

var g_model_tex = new Texture();
g_model_tex.loadPNG("./modeltex.png",256,256);
var g_model_deck = new TileDeck();
g_model_deck.setTexture(g_model_tex);
g_model_deck.setSize(16,16,16,16);



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
        out.a=vec3.fromValues(0+x,0+y,1+z);
        out.b=vec3.fromValues(1+x,0+y,1+z);
        out.c=vec3.fromValues(1+x,0+y,0+z);
        out.d=vec3.fromValues(0+x,0+y,0+z);
        out.e=vec3.fromValues(0+x,1+y,1+z);
        out.f=vec3.fromValues(1+x,1+y,1+z);
        out.g=vec3.fromValues(1+x,1+y,0+z);
        out.h=vec3.fromValues(0+x,1+y,0+z);

        var uvary = new Float32Array(4);
        g_atlas_deck.getUVFromIndex(uvary,blk.deck_index,0,0,0);
        out.uv_lt=vec2.fromValues(uvary[0],uvary[1]);
        out.uv_rt=vec2.fromValues(uvary[2],uvary[1]);
        out.uv_lb=vec2.fromValues(uvary[0],uvary[3]);
        out.uv_rb=vec2.fromValues(uvary[2],uvary[3]);

        var col=blk.color;
        out.ypcol=vec4.clone(col);
        out.xncol=vec4.fromValues(col[0]*0.8,col[1]*0.8,col[2]*0.8,1);
        out.zncol=vec4.fromValues(col[0]*0.7,col[1]*0.7,col[2]*0.7,1);
        out.xpcol=vec4.fromValues(col[0]*0.6,col[1]*0.6,col[2]*0.6,1);
        out.zpcol=vec4.fromValues(col[0]*0.5,col[1]*0.5,col[2]*0.5,1);                        
        out.yncol=vec4.fromValues(col[0]*0.4,col[1]*0.4,col[2]*0.4,1);                        
        
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
    setBlock(ix,iy,iz,shapeid,dkind,col4) {
        ix=to_i(ix);
        iy=to_i(iy);
        iz=to_i(iz);        
        var block={x:ix,y:iy,z:iz,shape:shapeid,deck_index:dkind,color:col4,chunk_id:this.chunk_id};                
        var ind = this.findBlock(ix,iy,iz);
        if(ind>=0) {
            this.blocks[ind] = block;
        } else {
            this.blocks.push(block);
        }
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
            
            geom.setPosition3v(0+vi,vv.a); geom.setPosition3v(1+vi,vv.b); geom.setPosition3v(2+vi,vv.c); geom.setPosition3v(3+vi,vv.d);//-y
            geom.setPosition3v(4+vi,vv.e); geom.setPosition3v(5+vi,vv.f); geom.setPosition3v(6+vi,vv.g); geom.setPosition3v(7+vi,vv.h);//+y
            geom.setPosition3v(8+vi,vv.a); geom.setPosition3v(9+vi,vv.b); geom.setPosition3v(10+vi,vv.f); geom.setPosition3v(11+vi,vv.e);//+z
            geom.setPosition3v(12+vi,vv.c); geom.setPosition3v(13+vi,vv.d); geom.setPosition3v(14+vi,vv.h); geom.setPosition3v(15+vi,vv.g);//-z
            geom.setPosition3v(16+vi,vv.b); geom.setPosition3v(17+vi,vv.c); geom.setPosition3v(18+vi,vv.g); geom.setPosition3v(19+vi,vv.f);//+x
            geom.setPosition3v(20+vi,vv.d); geom.setPosition3v(21+vi,vv.a); geom.setPosition3v(22+vi,vv.e); geom.setPosition3v(23+vi,vv.h);//-x

            geom.setUV2v(0+vi,vv.uv_lb); geom.setUV2v(1+vi,vv.uv_rb); geom.setUV2v(2+vi,vv.uv_rt); geom.setUV2v(3+vi,vv.uv_lt); // abcd
            geom.setUV2v(4+vi,vv.uv_lb); geom.setUV2v(5+vi,vv.uv_rb); geom.setUV2v(6+vi,vv.uv_rt); geom.setUV2v(7+vi,vv.uv_lt); // efgh
            geom.setUV2v(8+vi,vv.uv_lb); geom.setUV2v(9+vi,vv.uv_rb); geom.setUV2v(10+vi,vv.uv_rt); geom.setUV2v(11+vi,vv.uv_lt); // abfe
            geom.setUV2v(12+vi,vv.uv_lb); geom.setUV2v(13+vi,vv.uv_rb); geom.setUV2v(14+vi,vv.uv_rt); geom.setUV2v(15+vi,vv.uv_lt); // cdhg
            geom.setUV2v(16+vi,vv.uv_lb); geom.setUV2v(17+vi,vv.uv_rb); geom.setUV2v(18+vi,vv.uv_rt); geom.setUV2v(19+vi,vv.uv_lt); // bcgf
            geom.setUV2v(20+vi,vv.uv_lb); geom.setUV2v(21+vi,vv.uv_rb); geom.setUV2v(22+vi,vv.uv_rt); geom.setUV2v(23+vi,vv.uv_lt); // daeh


            // colors
            for(var i=0;i<4;i++) geom.setColor4v(i+vi, vv.yncol);  
            for(var i=4;i<8;i++) geom.setColor4v(i+vi, vv.ypcol);
            for(var i=8;i<12;i++) geom.setColor4v(i+vi, vv.zpcol);
            for(var i=12;i<16;i++) geom.setColor4v(i+vi, vv.zncol);
            for(var i=16;i<20;i++) geom.setColor4v(i+vi, vv.xpcol);
            for(var i=20;i<24;i++) geom.setColor4v(i+vi, vv.xncol);

            
            // bottom
            geom.setFaceInds(0+fi, 0+vi,3+vi,1+vi); // ADB
            geom.setFaceInds(1+fi, 3+vi,2+vi,1+vi); // DCB
            // top
            geom.setFaceInds(2+fi, 7+vi,5+vi,6+vi); // HFG
            geom.setFaceInds(3+fi, 4+vi,5+vi,7+vi); // EFH
            // +z abf, afe
            geom.setFaceInds(4+fi, 8+vi,9+vi,10+vi); // abf
            geom.setFaceInds(5+fi, 8+vi,10+vi,11+vi); // afe
            // -z cdh, chg
            geom.setFaceInds(6+fi, 12+vi,13+vi,14+vi); // cdh
            geom.setFaceInds(7+fi, 12+vi,14+vi,15+vi); // chg
            // front
            geom.setFaceInds(8+fi, 16+vi,17+vi,18+vi); // EAB
            geom.setFaceInds(9+fi, 16+vi,18+vi,19+vi); // EBF
            // rear
            geom.setFaceInds(10+fi, 20+vi,21+vi,22+vi); // HCD
            geom.setFaceInds(11+fi, 20+vi,22+vi,23+vi); // HGC
            vi+=24;
            fi+=12;
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
            chk.setBlock(x,-1,z,SHAPE_CUBE,IDX_GROUND,col);
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
function putBlock(x,y,z,shape,dkind,col) {
    var chk = findChunkAt(x,y,z);
    if(chk) {
        chk.setBlock(x,y,z,shape,dkind,col);
        chk.updateMesh();
    } else {
        createNewChunk(x,y,z,shape,dkind,col);        
    }
}

function createNewChunk(x,y,z,shape,dkind,col) {
    var chk=new Chunk(g_model_tex);
    chk.setBlock(x,y,z,shape,dkind,col);
    chk.updateMesh();
    g_main_layer.insertProp(chk);
    g_chunks.push(chk);
    console.log("Created new chunk:",chk.chunk_id);
    return chk;
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
g_cross_prop.setColor(Color.fromValues(1,1,1,0.4));
g_hud_layer.insertProp(g_cross_prop);


///////////////////////////////
TOOL_BLOCK=1;
TOOL_PENCIL=2;
var g_cur_tool;
function setTool(t) {
    g_cur_tool= t;
    var nm="unknown";
    if(t==TOOL_BLOCK) nm = "Block";
    else if(t==TOOL_PENCIL) nm="Pencil";
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
            if(g_keyboard.getKey('2')) setTool(TOOL_PENCIL);
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
                    if(dt<0.2) {
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

