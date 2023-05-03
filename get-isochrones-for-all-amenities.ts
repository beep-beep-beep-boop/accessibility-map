const overpass_api_endpoint = "https://overpass-api.de/api/";
const graphhopper_api_endpoint = "http://localhost:8989/";

const city_name = "Portland";
const state_code = "OR"
const buckets = 8;
const time_limit = 80 * 60;

function build_overpass_query(city_name: string):string {
    const url_raw = `${overpass_api_endpoint}interpreter?data=[out:json];area["boundary"="administrative"]["name"="${city_name}"]["is_in:state_code"="${state_code}"]["admin_level"="8"];node["shop"="supermarket"](area);out;\n`
    return encodeURI(url_raw);
}

const resp_str = await fetch(build_overpass_query(city_name));
if (!resp_str.ok) {
    console.log("err in overpass request");
    Deno.exit(-1);
}

const resp = await resp_str.json();


function build_query(lat: number, lon: number, buckets: number, time_limit_seconds: number): string {
    const url = `${graphhopper_api_endpoint}isochrone?point=${lat},${lon}&profile=walk&buckets=${buckets}&time_limit=${time_limit_seconds}&reverse_flow=true`;
    return url;
}

function getRandomString(s: number) {
    if (s % 2 == 1) {
        throw new Deno.errors.InvalidData("Only even sizes are supported");
    }
    const buf = new Uint8Array(s / 2);
    crypto.getRandomValues(buf);
    let ret = "";
    for (let i = 0; i < buf.length; ++i) {
        ret += ("0" + buf[i].toString(16)).slice(-2);
    }
    return ret;
}

function wrap_featurecollection(polys:any):any {
    return {
        "type": "FeatureCollection",
        "features": polys,
    };
}

for (const e of resp.elements) {
    const url = build_query(e.lat, e.lon, buckets, time_limit);

    const iso_res_str = await fetch(url);
    if (!iso_res_str.ok) {
        console.log("graphhopper req error");
        Deno.exit(-1);
    }
    const iso_res = await iso_res_str.json();
    const iso = wrap_featurecollection(iso_res.polygons);

    await Deno.writeTextFile(`./isochrones/${getRandomString(6)}.geojson`, JSON.stringify(iso), {createNew:true});
}
