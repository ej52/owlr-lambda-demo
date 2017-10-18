'use strict';

const async       = require('async'),
      aws         = require('aws-sdk'),
      thumbnailer = require('./thumbnailer');

const S3 = new aws.S3(),
      TN = new thumbnailer(['jpg', 'png', 'gif']);

module.exports.generatethumb = (event, context, callback) => {
    const bucket  = event.Records[0].s3.bucket.name,
          srcKey  = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' ')),
          dstKey  = srcKey.replace('snapshots', 'thumbnails');

    async.waterfall([
        function validate(next) {
          TN.validate(srcKey, (err, imageType) => {
              if (err) {
                  next(err);
              } else {
                  next(null, imageType);
              }
          });
        },
        function download(imageType, next) {
            // Download the image from S3 into a buffer.
            S3.getObject({
                Bucket: bucket,
                Key: srcKey
            }, (err, data) => {
                if (err) {
                    next(err);
                } else {
                    next(null, data, imageType);
                }
            });
        },
        function transform(response, imageType, next) {
            TN.generate(response.Body, imageType, (err, buffer) => {
                if (err) {
                    next(err);
                } else {
                    next(null, response.ContentType, buffer);
                }
            });
        },
        function upload(contentType, data, next) {
            // Stream the transformed image back to the bucket as thumbnail.
            S3.putObject({
                  ACL: 'public-read',
                  Bucket: bucket,
                  Key: dstKey,
                  Body: data,
                  ContentType: contentType
              }, next);
        }
      ],
      function (err) {
        if (err) {
            console.error(
                'Unable to resize ' + bucket + '/' + srcKey +
                ' and upload to ' + bucket + '/' + dstKey +
                ' due to an error: ' + err
            );
        } else {
            console.log(
                'Successfully resized ' + bucket + '/' + srcKey +
                ' and uploaded to ' + bucket + '/' + dstKey
            );
        }

        callback(null, 'success');
    });
};
