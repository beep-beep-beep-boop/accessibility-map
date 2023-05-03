import {resolve} from "https://deno.land/std/path/mod.ts";
import * as turf from "npm:@turf/turf@6";
import * as R from "https://deno.land/x/ramda@v0.27.2/mod.ts";

const base_path = './isochrones';

let isos = [];

for await(const f of Deno.readDir(base_path)) {
    if(!f.isFile) continue;
    const text = await Deno.readTextFile(resolve(base_path, f.name));
    const iso = JSON.parse(text);
    isos.push(iso);
}

function get_feature(num: number) {
    const oneone = isos.reduce(
        (acc, v) => R.append(v['features'][num], acc),
        []
    );

    const u = oneone.reduce(
        (acc, v) => turf.union(acc, v),
        oneone[0]
    );
    u['properties']['bucket'] = num;

    return u;
}

let features = []
for (let i = 0; i < isos[0]['features'].length; i++) {
    features.push(get_feature(i));
}

let diff_features = features.reduce(
    (acc, v) => {
        if (acc.length === 0) return [v];
        const u = acc.reduce(
            (acc, v) => turf.union(acc, v),
            acc[0]
        );
        return R.append(turf.difference(v, u, acc), acc);
    },
    []
)

Deno.writeTextFileSync("./combined.geojson", JSON.stringify(turf.featureCollection(diff_features)), {createNew: true});