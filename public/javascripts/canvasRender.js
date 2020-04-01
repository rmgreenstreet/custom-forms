 // Returns the max Y value in our data list
 function getMaxY(data) {
    var max = 0;
    
    for(var i = 0; i < data.length; i ++) {
        if(data[i].count > max) {
            max = data[i].count;
        }
    }
    
    max += 10 - max % 10;
    return max;
}

function renderCanvas(canvas, points, otherPoints) {
    console.log('drawing on canvas');

    if(canvas.getContext) {
        var xPadding = 30;
        var yPadding = 30;

        

        if (otherPoints && otherPoints.length > 0) {
            const combinedPoints = points.concat(otherPoints);
            var yMax = getMaxY(combinedPoints);
        } else {
            var yMax = getMaxY(points);
        }
        
        var ctx = canvas.getContext('2d');
        ctx.font = 'italic 8pt sans-serif';
        ctx.beginPath();
        ctx.lineWidth = 6;
        ctx.moveTo(yPadding,0);
        ctx.lineTo(yPadding,(canvas.height - xPadding));
        ctx.lineTo(canvas.width,(canvas.height - xPadding));
        ctx.stroke();
        ctx.moveTo(yPadding,xPadding);

        // Return the y pixel for a graph point
        function getYPixel(val) {
            return canvas.height - (((canvas.height - yPadding) / yMax) * (val)) - yPadding;
        }

        // Draw the X value texts
        for(var i = 0; i < points.length; i ++) {
            ctx.fillText(points[i].month, (i * ((canvas.width - yPadding) / points.length) + xPadding), canvas.height - yPadding + 20);
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
        }
        function drawLine(primaryPoints, color) {
            ctx.moveTo(0 + yPadding, getYPixel(points[0].count));
            ctx.beginPath();
            ctx.fillStyle=color;
            ctx.strokeStyle=color;
            primaryPoints.forEach((point) => {
                let x = primaryPoints.indexOf(point) * ((canvas.width - yPadding) / primaryPoints.length) + xPadding;
                let y = (getYPixel(point.count)) ;
                ctx.lineWidth = 2;
                ctx.lineTo(x,y);
                ctx.closePath();
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(x,y,5,0,360,false);
                ctx.closePath();
                ctx.fill();
            });
        }
        drawLine(points, 'blue');
        if(otherPoints && otherPoints.length > 0) {
            drawLine(otherPoints, 'green');
        }
    }
};

var canvases = document.querySelectorAll('canvas');
const pointsOne = [
    {month: 'March', count: 7},
    {month: 'April', count: 8},
    {month: 'May', count: 6},
    {month: 'June', count: 12},
    {month: 'July', count: 9},
    {month: 'August', count: 11}
];

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

var recentCompaniesPoints = [
    {month:'January', count:7},
    {month:'February', count:5},
    ...getPoints(recentCompanies)
];

function getPoints(items) {
    let points = []
    items.forEach((item) => {
        const createdMonth = new Date(item.created).getMonth();
        let existingPoint = points.find(point => point.month === monthNames[createdMonth]);
        console.log(existingPoint);
        if (existingPoint) {
            existingPoint.count ++;
        } else {
            points.push({month:monthNames[createdMonth], count: 1});
        }
    });
    return points;
};

console.log(recentCompanies);
console.log(recentLocations);


var recentLocationsPoints = [
    {month:'January', count:2},
    {month:'February', count:4},
    // ...getPoints(recentLocations)
];

canvases.forEach((canvas) => {
    renderCanvas(canvas,recentCompaniesPoints, recentLocationsPoints);
});