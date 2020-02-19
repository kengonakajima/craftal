
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
//
//
// Slope
//
//
//                     d,d,-d
//                     G
//                   //|
//                /  / |
//             /    F  |
//          /     / |  |      -z                   5
//       /      /   |  |      /                   4
//     D ----/------|- C
//    /   /         | /
//   / /            |/                         3   2
//  A ------------- B     >   +x              0   1
//  -d,-d,d
//
//
function getVertSet(blk,dk) {
    if(!dk) console.error("getVertSet: need dk", dk);
    var x=blk.x, y=blk.y, z=blk.z;
    var out={};
    if(blk.shape==SHAPE_CUBE) {
        var a=vec3.fromValues(0+x,0+y,1+z);
        var b=vec3.fromValues(1+x,0+y,1+z);
        var c=vec3.fromValues(1+x,0+y,0+z);
        var d=vec3.fromValues(0+x,0+y,0+z);
        var e=vec3.fromValues(0+x,1+y,1+z);
        var f=vec3.fromValues(1+x,1+y,1+z);
        var g=vec3.fromValues(1+x,1+y,0+z);
        var h=vec3.fromValues(0+x,1+y,0+z);

        out.num_verts=24;
        out.num_faces=12;
        
        out.positions = [
            a,b,c,d, // -y
            e,f,g,h, // +y
            a,b,f,e, // +z
            c,d,h,g, // -z
            b,c,g,f, // +x
            d,a,e,h, // -x
        ];
        
        var uvary = new Float32Array(4);
        dk.getUVFromIndex(uvary,blk.uvinds[0],0,0,0);
        var uv_xp_lt=vec2.fromValues(uvary[0],uvary[1]);
        var uv_xp_rt=vec2.fromValues(uvary[2],uvary[1]);
        var uv_xp_lb=vec2.fromValues(uvary[0],uvary[3]);
        var uv_xp_rb=vec2.fromValues(uvary[2],uvary[3]);
        dk.getUVFromIndex(uvary,blk.uvinds[1],0,0,0);
        var uv_xn_lt=vec2.fromValues(uvary[0],uvary[1]);
        var uv_xn_rt=vec2.fromValues(uvary[2],uvary[1]);
        var uv_xn_lb=vec2.fromValues(uvary[0],uvary[3]);
        var uv_xn_rb=vec2.fromValues(uvary[2],uvary[3]);
        dk.getUVFromIndex(uvary,blk.uvinds[2],0,0,0);        
        var uv_yp_lt=vec2.fromValues(uvary[0],uvary[1]);
        var uv_yp_rt=vec2.fromValues(uvary[2],uvary[1]);
        var uv_yp_lb=vec2.fromValues(uvary[0],uvary[3]);
        var uv_yp_rb=vec2.fromValues(uvary[2],uvary[3]);
        dk.getUVFromIndex(uvary,blk.uvinds[3],0,0,0);        
        var uv_yn_lt=vec2.fromValues(uvary[0],uvary[1]);
        var uv_yn_rt=vec2.fromValues(uvary[2],uvary[1]);
        var uv_yn_lb=vec2.fromValues(uvary[0],uvary[3]);
        var uv_yn_rb=vec2.fromValues(uvary[2],uvary[3]);
        dk.getUVFromIndex(uvary,blk.uvinds[4],0,0,0);        
        var uv_zp_lt=vec2.fromValues(uvary[0],uvary[1]);
        var uv_zp_rt=vec2.fromValues(uvary[2],uvary[1]);
        var uv_zp_lb=vec2.fromValues(uvary[0],uvary[3]);
        var uv_zp_rb=vec2.fromValues(uvary[2],uvary[3]);                        
        dk.getUVFromIndex(uvary,blk.uvinds[5],0,0,0);        
        var uv_zn_lt=vec2.fromValues(uvary[0],uvary[1]);
        var uv_zn_rt=vec2.fromValues(uvary[2],uvary[1]);
        var uv_zn_lb=vec2.fromValues(uvary[0],uvary[3]);
        var uv_zn_rb=vec2.fromValues(uvary[2],uvary[3]);

        out.uvs = [
            uv_yn_lb, uv_yn_rb, uv_yn_rt, uv_yn_lt, // abcd
            uv_yp_lb, uv_yp_rb, uv_yp_rt, uv_yp_lt, // efgh
            uv_zp_lb, uv_zp_rb, uv_zp_rt, uv_zp_lt, // abfe
            uv_zn_lb, uv_zn_rb, uv_zn_rt, uv_zn_lt, // cdhg
            uv_xp_lb, uv_xp_rb, uv_xp_rt, uv_xp_lt, // bcgf
            uv_xn_lb, uv_xn_rb, uv_xn_rt, uv_xn_lt, // daeh
        ];


        var n_xp=vec3.fromValues(1,0,0);
        var n_xn=vec3.fromValues(-1,0,0);
        var n_yp=vec3.fromValues(0,1,0);
        var n_yn=vec3.fromValues(0,-1,0);
        var n_zp=vec3.fromValues(0,0,1);
        var n_zn=vec3.fromValues(0,0,-1);        
        out.normals = [
            n_yn, n_yn, n_yn, n_yn, // abcd
            n_yp, n_yp, n_yp, n_yp, // efgh
            n_zp, n_zp, n_zp, n_zp, // abfe
            n_zn, n_zn, n_zn, n_zn, // cdhg
            n_xp, n_xp, n_xp, n_xp, // +x
            n_xn, n_xn, n_xn, n_xn, // -x
        ];
        
        var col=blk.color;
        var ypcol=vec4.clone(col);
        var xncol=vec4.fromValues(col[0]*0.8,col[1]*0.8,col[2]*0.8,1);
        var zncol=vec4.fromValues(col[0]*0.7,col[1]*0.7,col[2]*0.7,1);
        var xpcol=vec4.fromValues(col[0]*0.6,col[1]*0.6,col[2]*0.6,1);
        var zpcol=vec4.fromValues(col[0]*0.5,col[1]*0.5,col[2]*0.5,1);                        
        var yncol=vec4.fromValues(col[0]*0.4,col[1]*0.4,col[2]*0.4,1);

        out.colors = [
            yncol,yncol,yncol,yncol,
            ypcol,ypcol,ypcol,ypcol,
            zpcol,zpcol,zpcol,zpcol,
            zncol,zncol,zncol,zncol,
            xpcol,xpcol,xpcol,xpcol,
            xncol,xncol,xncol,xncol,
        ];

        var face_yn_0 = [0,3,1]; // ADB
        var face_yn_1 = [3,2,1]; // DCB
        var face_yp_0 = [7,5,6]; // HFG
        var face_yp_1 = [4,5,7]; // EFH
        var face_zp_0 = [8,9,10]; // ABF
        var face_zp_1 = [8,10,11]; // AFE
        var face_zn_0 = [12,13,14]; // CDH
        var face_zn_1 = [12,14,15]; // CHG
        var face_xp_0 = [16,17,18]; // BCG
        var face_xp_1 = [16,18,19]; // BGF
        var face_xn_0 = [20,21,22]; // DAE
        var face_xn_1 = [20,22,23]; // DEH
        out.faces = [
            face_yn_0, face_yn_1,
            face_yp_0, face_yp_1,
            face_zp_0, face_zp_1,
            face_zn_0, face_zn_1,
            face_xp_0, face_xp_1,
            face_xn_0, face_xn_1,
        ];
    } else if(blk.shape==SHAPE_SLOPE) {
        var a=out.a=vec3.fromValues(0+x,0+y,1+z);
        var b=out.b=vec3.fromValues(1+x,0+y,1+z);
        var c=out.c=vec3.fromValues(1+x,0+y,0+z);
        var d=out.d=vec3.fromValues(0+x,0+y,0+z);
        //e
        var f=out.f=vec3.fromValues(1+x,1+y,1+z);
        var g=out.g=vec3.fromValues(1+x,1+y,0+z);
        //h

        // ypxn(slope),yn,xp,zn,zp
        out.num_verts=4+4+4+3+3; 
        out.num_faces=2+2+2+1+1;
        out.positions = [
            a,b,c,d, // -y
            a,f,g,d, // +y -x, slope
            b,c,g,f, // +x
            a,b,f,   // +z
            c,d,g,   // -z
        ];

        var uvary = new Float32Array(4);
        dk.getUVFromIndex(uvary,blk.uvinds[0],0,0,0);
        var uv_xp_lt=vec2.fromValues(uvary[0],uvary[1]);
        var uv_xp_rt=vec2.fromValues(uvary[2],uvary[1]);
        var uv_xp_lb=vec2.fromValues(uvary[0],uvary[3]);
        var uv_xp_rb=vec2.fromValues(uvary[2],uvary[3]);
        dk.getUVFromIndex(uvary,blk.uvinds[1],0,0,0);
        var uv_slope_lt=vec2.fromValues(uvary[0],uvary[1]);
        var uv_slope_rt=vec2.fromValues(uvary[2],uvary[1]);
        var uv_slope_lb=vec2.fromValues(uvary[0],uvary[3]);
        var uv_slope_rb=vec2.fromValues(uvary[2],uvary[3]);
        dk.getUVFromIndex(uvary,blk.uvinds[2],0,0,0);        
        var uv_yn_lt=vec2.fromValues(uvary[0],uvary[1]);
        var uv_yn_rt=vec2.fromValues(uvary[2],uvary[1]);
        var uv_yn_lb=vec2.fromValues(uvary[0],uvary[3]);
        var uv_yn_rb=vec2.fromValues(uvary[2],uvary[3]);
        dk.getUVFromIndex(uvary,blk.uvinds[3],0,0,0);        
        var uv_zp_lt=vec2.fromValues(uvary[0],uvary[1]);
        var uv_zp_rt=vec2.fromValues(uvary[2],uvary[1]);
        var uv_zp_lb=vec2.fromValues(uvary[0],uvary[3]);
        var uv_zp_rb=vec2.fromValues(uvary[2],uvary[3]);                        
        dk.getUVFromIndex(uvary,blk.uvinds[4],0,0,0);        
        var uv_zn_lt=vec2.fromValues(uvary[0],uvary[1]);
        var uv_zn_rt=vec2.fromValues(uvary[2],uvary[1]);
        var uv_zn_lb=vec2.fromValues(uvary[0],uvary[3]);
        var uv_zn_rb=vec2.fromValues(uvary[2],uvary[3]);

        out.uvs = [
            uv_yn_lb, uv_yn_rb, uv_yn_rt, uv_yn_lt, // abcd
            uv_slope_lb, uv_slope_rb, uv_slope_rt, uv_slope_lt, // afgd
            uv_xp_lb, uv_xp_rb, uv_xp_rt, uv_xp_lt, // bcgf            
            uv_zp_lb, uv_zp_rb, uv_zp_rt,  // abf
            uv_zn_lb, uv_zn_rb, uv_zn_lt, // cdg
        ];

        var n_xp=vec3.fromValues(1,0,0);
        var n_slope=vec3.fromValues(-1,1,0);
        vec3.normalize(n_slope,n_slope);
        var n_yn=vec3.fromValues(0,-1,0);
        var n_zp=vec3.fromValues(0,0,1);
        var n_zn=vec3.fromValues(0,0,-1);        
        out.normals = [
            n_yn, n_yn, n_yn, n_yn, // abcd
            n_slope, n_slope, n_slope, n_slope, // slope
            n_xp, n_xp, n_xp, n_xp, // bcgf
            n_zp, n_zp, n_zp, // abf
            n_zn, n_zn, n_zn, // cdg
        ];
        
        var col=blk.color;
        var slopecol=vec4.clone(col);
        var zncol=vec4.fromValues(col[0]*0.7,col[1]*0.7,col[2]*0.7,1);
        var xpcol=vec4.fromValues(col[0]*0.6,col[1]*0.6,col[2]*0.6,1);
        var zpcol=vec4.fromValues(col[0]*0.5,col[1]*0.5,col[2]*0.5,1);                        
        var yncol=vec4.fromValues(col[0]*0.4,col[1]*0.4,col[2]*0.4,1);

        out.colors = [
            yncol,yncol,yncol,yncol,
            slopecol,slopecol,slopecol,slopecol,
            xpcol,xpcol,xpcol,xpcol,            
            zpcol,zpcol,zpcol,
            zncol,zncol,zncol,
        ];

        var face_yn_0 = [0,3,1]; // ADB
        var face_yn_1 = [3,2,1]; // DCB
        var face_slope_0 = [7,5,6]; // DFG
        var face_slope_1 = [4,5,7]; // AFD
        var face_xp_0 = [8,9,10]; // BCG
        var face_xp_1 = [8,10,11]; // BGF        
        var face_zp = [12,13,14]; // ABF
        var face_zn = [15,16,17]; // CDG


        out.faces = [
            face_yn_0, face_yn_1,
            face_slope_0, face_slope_1,
            face_xp_0, face_xp_1,
            face_zp,
            face_zn
        ];
        
    }
    return out;
}
//////////////////

var g_chunk_id_gen=1;

class Chunk extends Prop3D {
    // 巨大な地形を表現する必要がないので、3次元配列ボクセルじゃなくて、単純な配列にしておく
    // コリジョンも地面だけでいい気がしてきた.
    constructor(deck) {
        super();
        this.blocks=[];

        this.deck=deck;
        this.enable_frustum_culling = false;
        this.setMaterial(g_collitshader);
        this.setTexture(deck.moyai_tex);
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
        if(getUVIndexSpace()<6) {
            console.log("uvindex no space left!");
            return;
        }
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
        var num_tile_need;
        if(shapeid==SHAPE_CUBE) num_tile_need=6; else if(shapeid==SHAPE_SLOPE) num_tile_need=5;
        block.uvinds=new Int32Array(num_tile_need);        
        for(var i=0;i<num_tile_need;i++) {
            if(dkind===undefined) {            
                block.uvinds[i]=allocateUVIndex(); // must success.
            } else {
                block.uvinds[i]=dkind;
            }
        }
    }
    removeBlock(ix,iy,iz) {
        for(var i in this.blocks) {
            var b=this.blocks[i];
            if(b.x==ix && b.y==iy && b.z==iz) {
                this.blocks.splice(i,1);
                for(var i=0;i<b.uvinds.length;i++) freeUVIndex(b.uvinds[i]);
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
        var num_verts = num_block * 6*4;
        // face count
        var num_faces = num_block * 6*2;
        var geom = new FaceGeometry(num_verts,num_faces);



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
            var vv=getVertSet(block,this.deck);
            for(var i=0;i<vv.num_verts;i++) geom.setPosition3v(i+vi,vv.positions[i]);
            for(var i=0;i<vv.num_verts;i++) geom.setUV2v(i+vi,vv.uvs[i]);
            for(var i=0;i<vv.num_verts;i++) geom.setColor4v(i+vi,vv.colors[i]);
            for(var i=0;i<vv.num_verts;i++) geom.setNormal3v(i+vi,vv.normals[i]);            
            for(var i=0;i<vv.num_faces;i++) geom.setFaceInds(i+fi,vv.faces[i][0]+vi, vv.faces[i][1]+vi,vv.faces[i][2]+vi);
            
            vi+=vv.num_verts;
            fi+=vv.num_faces;
        }
//        console.log("updateMesh: geom:",geom);
        this.setGeom(geom);    // TODO: dispose older one     
    }
};

