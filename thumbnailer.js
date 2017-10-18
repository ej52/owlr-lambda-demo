'use strict'
const gm = require('gm').subClass({ imageMagick: true });

class Thumbnailer {
    constructor(allowedTypes) {
        this.allowedTypes = allowedTypes || ['jpg', 'png', 'gif'];
    }

    validate(filename, callback) {
        const typeMatch = filename.match(/\.([^.]*)$/);
        if (!typeMatch) {
            callback('Could not determine the image type.');
            return;
        }

        const imageType = typeMatch[1];
        if (this.allowedTypes.indexOf(imageType) === -1) {
            callback('Unsupported image type: ' + imageType);
            return;
        }

        callback(null, imageType);
    }

    generate(buffer, imageType, callback) {
        const image = gm(buffer);

        image.size(function(err, size) {
            const scalingFactor = Math.min(
                250 / size.width,
                250 / size.height
            ),
            width  = scalingFactor * size.width,
            height = scalingFactor * size.height;

            // Transform the image buffer in memory.
            image.resize(width, height).toBuffer(imageType, callback);
        });

    }
}

module.exports = Thumbnailer;
