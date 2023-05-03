## how this works

`get-isochrones-for-all-amenities.ts` fetches points of all things (e.g. grocery store) within a given area and fills the `./isochrones` folder with isochrone geojson files for each point (generated using graphhopper api - you can run an instance yourself really easily)

`merge-isochrones.ts` combines all those isochrones into one file `./combined.geojson`, unifying each bucket (polygon for each time increment) between the files and cutting out the shorter buckets from the longer ones so they won't overlap.

scripts should be ran with deno
