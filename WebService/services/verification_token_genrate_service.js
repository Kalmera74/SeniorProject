import PortalVerificationStringModel from '../models/portalVerificationString'
import cryptoRandomString from 'crypto-random-string';


//Generate url for portal user to be register on the system
const genratePortalRegistrationLink = (req, res) => {
    const token = cryptoRandomString({length: 15});
    new PortalVerificationStringModel({
        token
    }).save()
    .then(result => {
        if(req.hostname === 'localhost'){
            // req.protocol = http/https
            //req.hostname - localhost / example.com -> example
            //
            
            res.status(200).send({
                registrationUrl:req.protocol+"://"+req.hostname+":5000/auth/portalRegister/"+token
            })
        }else{
            res.status(200).send({
                registrationUrl:req.protocol+"://"+req.hostname+"/auth/portalRegister/"+token
            })
        }
        
    })
}
export default genratePortalRegistrationLink;