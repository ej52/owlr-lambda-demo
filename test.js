const thumbnailer = require('./thumbnailer'),
      path        = require('path'),
      chai        = require('chai'),
      expect      = chai.expect,
      TN          = new thumbnailer(['jpg', 'gif']),
      filename    = path.resolve('./mockdata/image.jpg');

describe('thumbnailer', function() {
    it('should not return a vaild imageType', function() {
        TN.validate(filename.replace('jpg', 'png'), (err, imageType) => {
            expect(err).to.exist;
        });
    });

    it('should return a vaild imageType', function() {
        TN.validate(filename, (err, imageType) => {
            expect(err).to.not.exist;
            expect(imageType).to.equal('jpg');
        });
    });

    it('should generate thumbnail buffer', function() {
        TN.generate(filename, 'jpg', (err, buffer) => {
            expect(err).to.not.exist;
            expect(buffer).to.exist;
            expect(buffer).to.be.instanceof(Buffer)
        });
    });
});
