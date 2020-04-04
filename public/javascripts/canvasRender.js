var canvases = document.querySelectorAll('canvas');

// const monthNames = ["January", "February", "March", "April", "May", "June",
//   "July", "August", "September", "October", "November", "December"
// ];

const colors = ['blue','green','orange','purple','teal','fuschia'];

//converts full object data from server into {month: String, count: Number} objects
function getPoints(items) {
    let points = []
    items.forEach((item) => {
        const createdDate = new Date(item.created)
        const monthYear = `${createdDate.getMonth() + 1}/${createdDate.getFullYear()}`;
        console.log(monthYear);
        let existingPoint = points.find(point => point.x === monthYear);
        if (existingPoint) {
            existingPoint.y ++;
        } else {
            points.push({x:monthYear, y: 1});
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

/* compare two arrays and if there are any missing months in either array, add them with a y value of 0, then sortby month/year */
function equalize(arr1, arr2) {
    let newArr = arr2.reduce(function (result, obj2) {
        if (arr1.some(obj1 => obj1['x'] === obj2['x'])) {
            return result;
        }
        return [...result, {'x' : obj2['x'], 'y':0}];
    }, arr1);
    newArr.sort(function (a, b) {
        a = a.x.split('/');
        b = b.x.split('/')
        return new Date(a[1], a[0], 1) - new Date(b[1], b[0], 1)
    });
    return newArr;
};

function renderCanvas(canvas, data) {
    console.log('drawing on canvas');

    if(canvas.getContext) {
        var xPadding = 30;
        var yPadding = 30;
        var xLength = canvas.width - yPadding;
        var yLength = canvas.height - xPadding;
        var pointsArr = [];
        data.forEach(function (arr) {
            pointsArr.push(getPoints(arr));
        });
        for (let i = 0; i < pointsArr.length -1 ; i++) {
            pointsArr[i] = equalize(pointsArr[i], pointsArr[i+1]);
        };
        var combinedData = Array.prototype.concat.apply([], pointsArr);
        combinedData.sort(function(a,b) {
            return new Date(a.created) - new Date(b.created)
        });
        var filteredPoints = removeDuplicates(combinedData, 'x');

        /* cuts X axis into a number of sections double the number of points */ 
        var xSpacing = xLength / (totalMonths * 2);

        var yMax = getMaxY(combinedData);

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
                ctx.fillText(filteredPoints[i].x, yPadding, yLength +20);
            }else {
                ctx.fillText(filteredPoints[i].x, (yPadding) + (xSpacing * (2 * i)), yLength + 20);
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

        pointsArr.forEach(function (points) {
            drawLine(points, colors[Math.ceil(Math.random() * colors.length)]);
        });

        // drawLine(points, 'blue');
        // if(points2 && points2.length > 0) {
        //     drawLine(points2, 'green');
        // }
    }
};

canvases.forEach((canvas) => {
    renderCanvas(canvas,[recentCompanies, recentLocations]);
});
