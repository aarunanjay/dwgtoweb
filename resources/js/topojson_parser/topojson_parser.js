//--------------------------------------------------------
// This code simplifies topojson data into a 
// collection of integer co-ordinates for FM to render

// *** INPUT *** 
// Topo JSON Data

// *** OUTPUT *** 
// { geometries:[[[<int>,<int>],[<int>,<int>]]]}

// *** EXAMPLE USAGE *** 
// topoparser.scale = <float>
// topoparser.offset = { x:<float>, y:<float> }
// topoparser.convert(topoJSONData);
//--------------------------------------------------------

var topoparser =  {

	scale:1, // default value
	offset:{ x:0, y:0 }, // default value
	transform:undefined, 
	convert:function(topology) 
	{

		if(!topology) return undefined; // No topology *EXIT*
		if (!topology.transform) return undefined; // No transform *EXIT*

		this.transform = topology.transform;
		this.cleanseTransform(); 

		var TYPE_POINT = "Point";
		var TYPE_LINE = "LineString";
		var TYPE_POLYGON = "Polygon";
		
		var arcs = topology.arcs;
		var objects = topology.objects;
		var keys = Object.keys(objects);
		
		if (keys.length == 0) return undefined; // No outline info *EXIT*

		var geometries = objects[keys[0]].geometries;
		var optimizedGeometries = [];
		var geometry;
		var arc;
		var arcReferences;
		var arcReferencesCount;
		var reverserArcIndex;
		var coordinates;
		var i = 0;
		var j = 0;

		for (i in geometries) 
		{
			geometry = geometries[i];

			// Not enough geometry ? Skip to next iteration
			if (geometry.type == null || geometry.type == TYPE_POINT) continue;  
			
			// Limiting to just the first index for TYPE_POLYGON because arcs are undefined for other indexes.
			arcReferences = geometry.type == TYPE_LINE ?  geometry.arcs : geometry.arcs[0];
			arcReferencesCount = arcReferences.length;
			


			for (j = 0; j < arcReferencesCount; j++)
			{
				if(arcReferences[j] >= 0)
				{
					arc = arcs[arcReferences[j]];
					coordinates = this.arcToCoordinates(arc);
					
				}
				else
				{
					reverserArcIndex = (arcReferences[j] * -1) -1;
					arc = arcs[reverserArcIndex];
					coordinates = this.arcToCoordinates(arc).reverse();	
				}

				optimizedGeometries.push(coordinates);	
				
			}
			
		}

		return { geometries:optimizedGeometries };
	},
	arcToCoordinates:function arcToCoordinates(arc)
	{
		var x = 0;
		var y = 0;
		var tx = 0;
		var ty = 0;
		var transform = this.transform;
		var scale = this.scale;
		var offset = this.offset;

		return arc.map(function(point)
		{
			return [
				Math.floor((((x += point[0]) * transform.scale[0] + transform.translate[0]) / scale) + offset.x),
				Math.floor((((y += point[1]) * transform.scale[1] + transform.translate[1]) / scale) + offset.y)
			];
		});
	},
	cleanseTransform:function cleanseTransform()
	{
		this.transform.scale[0] = parseFloat(this.transform.scale[0]);
		this.transform.scale[1] = parseFloat(this.transform.scale[1]);

		this.transform.translate[0] = parseFloat(this.transform.translate[0]);
		this.transform.translate[1] = parseFloat(this.transform.translate[1]);
	}

}