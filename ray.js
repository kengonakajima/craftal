"use strict"


// 以下素朴なBox交差判定用Ray
class SimpleRay {
    constructor() {
        this.orig=vec3.create();
        this.dir=vec3.create();
        this.invdir=vec3.create();
        this.sign=[0,0,0];
    }
    update(camloc,dirv) {
        vec3.copy(this.orig,camloc);
        vec3.copy(this.dir,dirv);
        vec3.set(this.invdir, 1/this.dir[0], 1/this.dir[1], 1/this.dir[2]);
        this.sign[0] = (this.invdir[0] < 0)?1:0; 
        this.sign[1] = (this.invdir[1] < 0)?1:0; 
        this.sign[2] = (this.invdir[2] < 0)?1:0;
    }
    intersectBox(minv,maxv) {
        var bounds=[minv,maxv];
        var tmin, tmax, tymin, tymax, tzmin, tzmax; 

        tmin = (bounds[this.sign[0]][0] - this.orig[0]) * this.invdir[0]; 
        tmax = (bounds[1-this.sign[0]][0] - this.orig[0]) * this.invdir[0]; 
        tymin = (bounds[this.sign[1]][1] - this.orig[1]) * this.invdir[1]; 
        tymax = (bounds[1-this.sign[1]][1] - this.orig[1]) * this.invdir[1]; 
 
        if ((tmin > tymax) || (tymin > tmax)) return false; 
        if (tymin > tmin) tmin = tymin; 
        if (tymax < tmax) tmax = tymax; 
 
        tzmin = (bounds[this.sign[2]][2] - this.orig[2]) * this.invdir[2]; 
        tzmax = (bounds[1-this.sign[2]][2] - this.orig[2]) * this.invdir[2]; 
 
        if ((tmin > tzmax) || (tzmin > tmax)) return false; 
        if (tzmin > tmin) tmin = tzmin; 
        if (tzmax < tmax) tmax = tzmax;
        return true; 
    }
} ;

// 以下ボクセル用最適化Ray

function traceVoxelRay_impl( getVoxel,
	px, py, pz,
	dx, dy, dz,
	max_d, hit_pos, hit_norm) {
	
	// consider raycast vector to be parametrized by t
	//   vec = [px,py,pz] + t * [dx,dy,dz]
	
	// algo below is as described by this paper:
	// http://www.cse.chalmers.se/edu/year/2010/course/TDA361/grid.pdf
	
	var t = 0.0
		, floor = Math.floor
		, ix = floor(px) | 0
		, iy = floor(py) | 0
		, iz = floor(pz) | 0

		, stepx = (dx > 0) ? 1 : -1
		, stepy = (dy > 0) ? 1 : -1
		, stepz = (dz > 0) ? 1 : -1
		
	// dx,dy,dz are already normalized
		, txDelta = Math.abs(1 / dx)
		, tyDelta = Math.abs(1 / dy)
		, tzDelta = Math.abs(1 / dz)

		, xdist = (stepx > 0) ? (ix + 1 - px) : (px - ix)
		, ydist = (stepy > 0) ? (iy + 1 - py) : (py - iy)
		, zdist = (stepz > 0) ? (iz + 1 - pz) : (pz - iz)
		
	// location of nearest voxel boundary, in units of t 
		, txMax = (txDelta < Infinity) ? txDelta * xdist : Infinity
		, tyMax = (tyDelta < Infinity) ? tyDelta * ydist : Infinity
		, tzMax = (tzDelta < Infinity) ? tzDelta * zdist : Infinity

		, steppedIndex = -1
	
	// main loop along raycast vector
	while (t <= max_d) {
		// exit check
		var b = getVoxel(ix, iy, iz)
		if (b) {
			if (hit_pos) {
				hit_pos[0] = px + t * dx
				hit_pos[1] = py + t * dy
				hit_pos[2] = pz + t * dz

                var ep = 0.0000001;
                if(Math.floor(hit_pos[0]+ep)>Math.floor(hit_pos[0])) hit_pos[0]+=ep;
                if(Math.floor(hit_pos[1]+ep)>Math.floor(hit_pos[1])) hit_pos[1]+=ep;
                if(Math.floor(hit_pos[2]+ep)>Math.floor(hit_pos[2])) hit_pos[2]+=ep;                
			}
			if (hit_norm) {
				hit_norm[0] = hit_norm[1] = hit_norm[2] = 0
				if (steppedIndex === 0) hit_norm[0] = -stepx
				if (steppedIndex === 1) hit_norm[1] = -stepy
				if (steppedIndex === 2) hit_norm[2] = -stepz
			}
			return b
		}
		
		// advance t to next nearest voxel boundary
		if (txMax < tyMax) {
			if (txMax < tzMax) {
				ix += stepx
				t = txMax
				txMax += txDelta
				steppedIndex = 0
			} else {
				iz += stepz
				t = tzMax
				tzMax += tzDelta
				steppedIndex = 2
			}
		} else {
			if (tyMax < tzMax) {
				iy += stepy
				t = tyMax
				tyMax += tyDelta
				steppedIndex = 1
			} else {
				iz += stepz
				t = tzMax
				tzMax += tzDelta
				steppedIndex = 2
			}
		}

	}
	
	// no voxel hit found
	if (hit_pos) {
		hit_pos[0] = px + t * dx
		hit_pos[1] = py + t * dy
		hit_pos[2] = pz + t * dz
	}
	if (hit_norm) {
		hit_norm[0] = hit_norm[1] = hit_norm[2] = 0
	}

	return 0

}


// conform inputs

function traceVoxelRay(getVoxel, origin, direction, max_d, hit_pos, hit_norm) {
	var px = +origin[0]
		, py = +origin[1]
		, pz = +origin[2]
		, dx = +direction[0]
		, dy = +direction[1]
		, dz = +direction[2]
		, ds = Math.sqrt(dx * dx + dy * dy + dz * dz)

	if (ds === 0) {
		throw new Error("Can't raycast along a zero vector")
	}

	dx /= ds
	dy /= ds
	dz /= ds
	if (typeof (max_d) === "undefined") {
		max_d = 64.0
	} else {
		max_d = +max_d
	}
	return traceVoxelRay_impl(getVoxel, px, py, pz, dx, dy, dz, max_d, hit_pos, hit_norm)
}


