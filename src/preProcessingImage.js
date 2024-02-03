// var RED_INTENCITY_COEF = 0.2126;
// var GREEN_INTENCITY_COEF = 0.7152;
// var BLUE_INTENCITY_COEF = 0.0722;

var RED_INTENCITY_COEF = 0.4126;
var GREEN_INTENCITY_COEF = 0.9752;
var BLUE_INTENCITY_COEF = 0.9752;



// Currently only greyscaling the image however other functions have been written. Further testing needs to be done to see
// What we can do with the image to improve accuracy

function preprocessImage(canvas) {
    const ctx = canvas.getContext('2d');
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // blackAndWhite(image); 
    greyscale(image);
 
   
    return image;
}






function binarize(otsuThresh, image) {
    var data = image.data;
    var val;
    
    for(var i = 0; i < data.length; i += 4) {
        var brightness = RED_INTENCITY_COEF * data[i] + GREEN_INTENCITY_COEF * data[i + 1] + BLUE_INTENCITY_COEF * data[i + 2];
        val = ((brightness > otsuThresh) ? 255 : 0);
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
    }
    
    // overwrite original image
    // context.putImageData(imageData, 0, 0);
}

function greyscale(imgData){
    for (let i = 0; i < imgData.data.length; i += 4) {
        let count = imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2];
        let colour = 0;
        if (count > 510) colour = 255;
        else if (count > 255) colour = 127.5;
    
        imgData.data[i] = colour;
        imgData.data[i + 1] = colour;
        imgData.data[i + 2] = colour;
        imgData.data[i + 3] = 255;
      }
}

function blackAndWhite(imgData){
    for (let i = 0; i < imgData.data.length; i += 4) {
        let count = imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2];
        let colour = 0;
        if (count > 383) colour = 255;
      
        imgData.data[i] = colour;
        imgData.data[i + 1] = colour;
        imgData.data[i + 2] = colour;
        imgData.data[i + 3] = 255;
      }
      
}


function hist(data) {
    var brightness;
    var brightness256Val;
    var histArray = Array.apply(null, new Array(256)).map(Number.prototype.valueOf,0);
    
    for (var i = 0; i < data.length; i += 4) {
        brightness = RED_INTENCITY_COEF * data[i] + GREEN_INTENCITY_COEF * data[i + 1] + BLUE_INTENCITY_COEF * data[i + 2];
        brightness256Val = Math.floor(brightness);
        histArray[brightness256Val] += 1;
    }
    
    return histArray;
};

function otsu(histogram, total) {
    var sum = 0;
    for (var i = 1; i < 256; ++i)
        sum += i * histogram[i];
    var sumB = 0;
    var wB = 0;
    var wF = 0;
    var mB;
    var mF;
    var max = 0.0;
    var between = 0.0;
    var threshold1 = 0.0;
    var threshold2 = 0.0;
    for (var i = 0; i < 256; ++i) {
        wB += histogram[i];
        if (wB == 0)
            continue;
        wF = total - wB;
        if (wF == 0)
            break;
        sumB += i * histogram[i];
        mB = sumB / wB;
        mF = (sum - sumB) / wF;
        between = wB * wF * Math.pow(mB - mF, 2);
        if ( between >= max ) {
            threshold1 = i;
            if ( between > max ) {
                threshold2 = i;
            }
            max = between;            
        }
    }
    return ( threshold1 + threshold2 ) / 2.0;
};


export default preprocessImage