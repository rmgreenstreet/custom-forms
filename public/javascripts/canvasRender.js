var canvases = document.querySelectorAll('canvas');

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
//converts full object data from server into {month: String, count: Number} objects
function getPoints(items) {
    let points = []
    items.forEach((item) => {
        const createdMonth = new Date(item.created).getMonth();
        let existingPoint = points.find(point => point.x === createdMonth);
        // console.log(`existingPoint:`,existingPoint);
        if (existingPoint) {
            existingPoint.y ++;
        } else {
            points.push({x:createdMonth, y: 1});
        }
    });
    return points;
};

// Returns the max Y value in our data list
 function getMaxY(data) {
    var max = 0;

    for(var i = 0; i < data.length; i ++) {
        if(data[i].y > max) {
            max = data[i].y;
        }
    }
    max += 10 - max % 10;
    return max;
}
/* Removes objects from combined data where month matches, in order to draw only one copy of that 
month on the X axis */
function removeDuplicates(originalArray, objKey) {
    var trimmedArray = [];
    var values = [];
    var value;

    for(var i = 0; i < originalArray.length; i++) {
      value = originalArray[i][objKey];

      if(values.indexOf(value) === -1) {
        trimmedArray.push(originalArray[i]);
        values.push(value);
      }
    }
    return trimmedArray;
};

function equalize(arr1, arr2) {
    arr1.forEach(function (item) {
        // console.log(`arr1[${i}].x: ${arr1[i].x}, arr2[${i}].x: ${arr2[i].x}`);
        const missingIndex = arr2.findIndex(function (obj) {
            obj.x === item.x;
        });
        if (missingIndex > 0) {
            for (let j = arr1.indexOf(item); j < missingIndex; j++) {
                arr1.splice(j,0,{x: arr2[missingIndex -j].x, y:0});
            };
        };
    });
    return arr1;
};

function renderCanvas(canvas, data, otherData) {
    console.log('drawing on canvas');

    if(canvas.getContext) {
        var xPadding = 30;
        var yPadding = 30;
        var xLength = canvas.width - yPadding;
        var yLength = canvas.height - xPadding;
        var points = getPoints(data);
        var otherPoints = getPoints(otherData);
        points = equalize(points,otherPoints);
        otherPoints = equalize(otherPoints,points);
        var combinedData = data.concat(otherData);
        console.log(`points: ${points}`);
        console.log(`otherPoints: ${otherPoints}`);
        combinedData.sort(function(a,b) {
            return new Date(a.created) - new Date(b.created)
        });

        /* cuts X axis into a number of sections double the number of points */ 
        var xSpacing = xLength / (totalMonths * 2);
        var combinedPoints = getPoints(combinedData);
        var filteredPoints = removeDuplicates(combinedPoints, 'x');


        if (otherPoints && otherPoints.length > 0) {
            var yMax = getMaxY(combinedPoints);
        } else {
            var yMax = getMaxY(points);
        }

        var ctx = canvas.getContext('2d');
        ctx.font = 'italic 8pt sans-serif';
        ctx.beginPath();
        ctx.lineWidth = 6;
        ctx.moveTo(yPadding,0);
        ctx.lineTo(yPadding,yLength);
        ctx.lineTo(canvas.width,yLength);
        ctx.stroke();
        ctx.closePath();

        // Return the y pixel for a graph point
        function getYPixel(val) {
            return yLength - ((yLength / yMax) * (val));
        }

        // Return the y pixel for a graph point
        function getXPixel(val) {
            return ((xSpacing + yPadding) + (xSpacing * (2 * val)))
        }

        /*this is where the issue is, I believe */
        function drawLine(points, color) {
            /* move one xSpacing out from y Axis */
            ctx.moveTo(yPadding + xSpacing, getYPixel(points[0].y));
            ctx.beginPath();
            ctx.fillStyle=color;
            ctx.strokeStyle=color;
            points.forEach((point) => {
                const x = getXPixel(points.indexOf(point));
                const y = (getYPixel(point.y)) ;
                ctx.lineWidth = 2;
                ctx.lineTo(x,y);
                ctx.closePath();
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(x,y,5,0,360,false);
                ctx.fillText(point.y, x + 2, y - 15);
                ctx.closePath();
                ctx.fill();
                ctx.moveTo(x,y);
            });
        }
        
        // Draw the X value texts
        for(var i = 0; i < totalMonths; i ++) {
            if (i===0) {
                ctx.fillText(monthNames[filteredPoints[i].x], yPadding, yLength +20);
            }else {
                ctx.fillText(monthNames[filteredPoints[i].x], (yPadding) + (xSpacing * (2 * i)), yLength + 20);
            }
        }

        // Draw the Y value texts
        ctx.textAlign = "right"
        ctx.textBaseline = "middle";

        for(var i = 0; i <= yMax; i += 10) {
            if (i === yMax) {
                ctx.fillText(i, xPadding - 10, getYPixel(i-1));
            } else {
                ctx.fillText(i, xPadding - 10, getYPixel(i));
            }
        };


        drawLine(points, 'blue');
        if(otherPoints && otherPoints.length > 0) {
            drawLine(otherPoints, 'green');
        }
    }
};

canvases.forEach((canvas) => {
    renderCanvas(canvas,recentCompanies, recentLocations);
});
