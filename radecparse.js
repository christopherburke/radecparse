// AUTHOR CHRISTOPHER J. BURKE
// MIT License
// Utilities for converting various celestial coordinates of various RA and Dec
// formats from strings to decimal degrees and inverse
// V1.0 2022-05-24

function protectint (x, tiny = 1.0e-8) {
  // Perform a floor int conversion of argument x,
  // unless x is within tiny of the next larger int, then
  // round up
  if (1.0 - (x % 1.0) < tiny) {
    return parseInt(x + tiny);
  } else {
    return parseInt(x);
  }
}
// Testing for protectint
//console.log(protectint(1.99));
//console.log(protectint(33399.99999));
//console.log(protectint(1.9999));
//console.log(protectint(1.9999,1.0e-3));

function protectzero (x, tiny = 1.0e-8) {
  // If argument x is within tiny of zero force it to zero
  if (Math.abs(x) < tiny) {
    return 0.0;
  } else {
    return x;
  }
}
// Testing for protectzero
//console.log(protectzero(0.1));
//console.log(protectzero(0.00001, 1.0e-3));
//console.log(protectzero(1.0));

function truncate (x, n) {
  // Truncate a floating point value, x, at the nth decimal
  var temp = Math.pow(10,n);
  return Math.floor(x * temp) / temp;
}
// Testing for Truncate
//console.log(truncate(6.32323,2));
//console.log(truncate(8.323, 4));
//console.log(truncate(8.323, 0));

function zeroPad(x, wantLen) {
  // Left zero pad a number to a requested wantLen length
  // From https://stackoverflow.com/a/1268377/8543811
  var absx = Math.abs(x);
  var padNZeros = Math.max(0, wantLen - Math.floor(absx).toString().length);
  var zeroPadStr = Math.pow(10,padNZeros).toString().substr(1);
  if (x < 0) {
    zeroPadStr = '-' + zeroPadStr;
  }
  return zeroPadStr + absx;
}
// Testing for zeroPad
//console.log(zeroPad(50,4));
//console.log(zeroPad(51234,3));
//console.log(zeroPad(51.1234,4));
//console.log(zeroPad(-51.1234,4));

function degconvert(ra, dec) {
  // Convert RA and declination given in decimals.
  // into various celestial coordinate string formats
  var deg2hr = 24.0/360.0;
  var colonform = '';
  var hmsform = '';
  var spaceform = '';
  var dmsform = '';
  var hdform = '';
  var validInputs = false;
  var validRa = false;
  var validDec = false;
  var errorStr = '';
  // Validate inputs
  if (ra >= 0.0 && ra < 360.0) {
    validRa = true;
  } else {
    errorStr += `Invalid RA Input: ${ra} - RA must be within range 0<=RA<360\n`;
  }
  if (dec >= -90.0 && dec <= 90.0) {
    validDec = true;
  } else {
    errorStr += `Invalid Dec Input: ${dec} - Declination must be within range -90<=Dec<=90\n`;
  }
  if (validRa && validDec) {
    validInputs = true;
  }
  // Finished validating inputs calculate the various string output formats
  if (validInputs) {
    // Convert RA deg to dms
    var radint = protectint(ra);
    var ram = (ra - radint) * 60.0;
    var ramint = protectint(ram);
    var ras = ra - radint - ramint / 60.0;
    ras = protectzero(ras * 3600.0);

    // Convert RA deg to hms
    var rahdecimal = ra * deg2hr;
    var rahint = protectint(rahdecimal);
    var ram2 = (rahdecimal - rahint) * 60.0;
    var ramint2 = protectint(ram2);
    var ras2 = rahdecimal - rahint - ramint2 / 60.0;
    ras2 = protectzero(ras2 * 3600.0);

    // Convert Declination deg to dms
    var sign = 1;
    var origdec = dec;
    if (dec < 0.0) {
      sign = -1;
      dec = Math.abs(dec);
    }
    var decdint = protectint(dec);
    var decm = (dec - decdint) * 60.0;
    var decmint = protectint(decm);
    var decs = dec - decdint - decmint / 60.0;
    decs = protectzero(decs * 3600.0);
    decdint = decdint * sign;
    // Create output strings
    colonform = `${zeroPad(rahint,2)}:${zeroPad(ramint2,2)}:${zeroPad(ras2.toFixed(3),2)} `;
    colonform += `${zeroPad(decdint,2)}:${zeroPad(decmint,2)}:${zeroPad(decs.toFixed(3),2)}`;
    hmsform = `${zeroPad(rahint,2)}h${zeroPad(ramint2,2)}m${zeroPad(ras2.toFixed(3),2)}s `;
    hmsform += `${zeroPad(decdint,2)}d${zeroPad(decmint,2)}m${zeroPad(decs.toFixed(3),2)}s`;
    spaceform = `${zeroPad(rahint,2)} ${zeroPad(ramint2,2)} ${zeroPad(ras2.toFixed(3),2)} `;
    spaceform += `${zeroPad(decdint,2)} ${zeroPad(decmint,2)} ${zeroPad(decs.toFixed(3),2)}`;
    dmsform = `${zeroPad(radint,2)}d${zeroPad(ramint,2)}m${zeroPad(ras.toFixed(3),2)}s `;
    dmsform += `${zeroPad(decdint,2)}d${zeroPad(decmint,2)}m${zeroPad(decs.toFixed(3),2)}s`;
    hdform = `${rahdecimal.toFixed(8)}h ${origdec.toFixed(8)}d`;
  }
  return [validInputs, colonform, hmsform, spaceform, dmsform, hdform, errorStr];
}
// Test degconvert
//let funcOut = degconvert(84.2911875, -80.4691197222);
//console.log(funcOut[1]);
//console.log(funcOut[2]);
//console.log(funcOut[3]);
//console.log(funcOut[4]);
//console.log(funcOut[5]);

function shrinkspaces(instr) {
  // If there are multiple consecutive spaces in a string remove
  // them until there is a single spaces
  var idx = instr.indexOf('  ');
  while (idx > -1) {
    instr = instr.substring(0,idx) + instr.substring(idx+1);
    idx = instr.indexOf('  ');
  }
  return instr;
}
//console.log(shrinkspaces('The Big     Dog   was  fast  !'));

function characterHist(instr) {
  // Return object with unique characters in string (instr) counted
  // From https://stackoverflow.com/a/67074634/8543811
  let charHist = [ ...instr ].reduce( ( a, c ) => ! a[ c ] ? { ...a, [ c ]: 1 } : { ...a, [ c ]: a[ c ] + 1 }, {} );
  return charHist;
}

function replaceCharWith(instr,matchChar,repChar) {
  // for the given string input, instr. Replace matchChar with replaceChar
  // if it matchChar exists
  var idx = instr.indexOf(matchChar);
  if (idx >= 0) {
    instr = instr.substring(0,idx) + repChar + instr.substring(idx+1);
  }
  return instr;
}

function rdp(cstr) {
  // Input argument cstr is a single string of numerous RA and declination formats
  // Convert string into a RA and declination in degree format

  // Replace instances of unicode minus-sign 0x2212 with 'normal' ascii 0x2d
  // Pages (e.g., Wikipedia) use the unicode minus sign rather than - for coordinates
  let idx = cstr.indexOf('\u2212');
  if (idx > -1) {
    cstr = cstr.substring(0,idx) + '-' + cstr.substring(idx+1);
  }
  // Remove consecutive spaces so the string gets split correctly
  cstr = shrinkspaces(cstr);
  // trim leading and trailing whitespace
  cstr = cstr.trim();
  var csplit = cstr.split(' ');
  var nTok = csplit.length;
  var fullstr = csplit.join('');
  var charhist = characterHist(fullstr);

  var nDec = 0, nColon = 0, nh = 0, nm = 0, ns = 0, nd = 0, nplus = 0, nneg = 0;
  // number of decimal points in string
  if ('.' in charhist) {
    nDec = charhist['.'];
  }
  // number of : in string
  if (':' in charhist) {
    nColon = charhist[':'];
  }
  // number of h
  if ('h' in charhist) {
    nh = charhist['h'];
  }
  // number of m
  if ('m' in charhist) {
    nm = charhist['m'];
  }
  // number of s
  if ('s' in charhist) {
    ns = charhist['s'];
  }
  // number of d
  if ('d' in charhist) {
    nd = charhist['d'];
  }
  // number of +
  if ('+' in charhist) {
    nplus = charhist['+'];
  }
  // number of -
  if ('-' in charhist) {
    nneg = charhist['-'];
  }
  var rastr = '';
  var decstr = '';
  //console.log(nTok, nDec, nColon, nh, nm, ns, nd, nplus, nneg);

  // default output for ra and dec [deg]
  var radeg = 0.0;
  var decdeg = 0.0;
  var ra = 0.0;
  var dec = 0.0;
  var errorStr = '';
  // constants
  const hr2deg = 15.0;
  const hrm2deg = hr2deg/60.0;
  const hrs2deg = hrm2deg/60.0;
  const m2deg = 1.0/60.0;
  const s2deg = m2deg/60.0;
  const deg2hr = 24.0/360.0;

  // Overall acceptance/validated flag
  var accept = false;
  // if there is a single token only accept if there is a + or -
  // to separate ra from dec
  if (nTok == 1 && (nplus == 1 || nneg == 1)) {
      // split token on plus or negative and reset the main storage
      if (nplus == 1) {
          var sidx = cstr.indexOf('+');
      } else {
          var sidx = cstr.indexOf('-');
      }
      csplit = [cstr.substring(0,sidx), cstr.substring(sidx)];
      nTok = 2;
      //console.log('Single Token splitting at +/-', csplit);
  }

  // Handle case of decimal format with d at end of each ra and dec
  // example  25.0d 36.0d
  if (nTok == 2 && (nDec >=0 && nDec<=2) && nColon == 0 && nh == 0 && nm == 0 && ns == 0 && nd == 2) {
      rastr = csplit[0];
      let idx = rastr.indexOf('d');
      if (idx >= 0) {
          rastr = rastr.substring(0,idx);
      }
      decstr = csplit[1];
      idx = decstr.indexOf('d');
      if (idx >= 0) {
          decstr = decstr.substring(0,idx);
      }
      csplit = [rastr, decstr];
      nd = 0;
      //console.log('Got 2 decimal numbers', csplit);
  }

  // Handle case of decimal format
  // case 25 36 or or 25 36.0 or 25.0 36 or 25.0 36.0 - two integers with no decimals or 2 decimals
  // treat as degrees for ra and dec
  if (nTok == 2 && (nDec >= 0 && nDec <= 2) && nColon == 0 && nh == 0 && nm == 0 && ns == 0 && nd == 0) {
      // validate ra dec range
      ra = parseFloat(csplit[0]);
      dec = parseFloat(csplit[1]);
      if (ra >= 0.0 && ra < 360.0 && dec >= -90.0 && dec <= 90.0) {
          accept = true;
          radeg = ra;
          decdeg = dec;
      } else {
          errorStr += `Invalid range of RA: ${ra} [0-360 deg) or declination: ${dec} [-90 - 90 deg]`;
      }
  }

  // Handle case of dms for ra string
  // by converting ra dms string to ra hms string convert to colon case then handling later
  // count number of times character appears From
  // https://stackoverflow.com/a/881111/8543811
  var rand = (csplit[0].split('d').length - 1);
  if (nTok == 2 && rand == 1 && nColon == 0) {
    rastr = csplit[0];
    ra = 0.0;
    var radsplit = rastr.split('d');
    var rad = parseFloat(radsplit[0]);
    let ranm = (radsplit[1].split('m').length -1);
    if (ranm == 1) {
        var ramsplit = radsplit[1].split('m');
        rad = rad + parseFloat(ramsplit[0])/60.0;
        var rans = (ramsplit[1].split('s').length - 1);
        if (rans == 1) {
            var rassplit = ramsplit[1].split('s');
            rad = rad + parseFloat(rassplit[0])/3600.0;
        }
    }
    let rah = rad * deg2hr;
    let rahint = protectint(rah);
    let ram = rah - rahint;
    let ramint = protectint(ram*60.0);
    let ras = ram - ramint/60.0;
    ras = truncate(protectzero(ras * 3600.0),3);
    csplit[0] = `${zeroPad(rahint,2)}:${zeroPad(ramint,2)}:${zeroPad(ras.toFixed(3),2)}`;
    nd = nd - 1;
    nh = 1;
    //console.log('RA dms handler result: '+csplit[0]);
  }

  // Handle case of hms and dms
  // This will be handled by replacing hms dms with colons and handling
  //  later with the colon case
  if (nTok == 2 && nColon == 0 && (nh > 0 || nm > 0 || ns > 0) && nd == 1) {
    nColon = 1
    var rastr = csplit[0];
    rastr = replaceCharWith(rastr, 'h',':');
    rastr = replaceCharWith(rastr, 'm',':');
    rastr = replaceCharWith(rastr, 's','');
    var decstr = csplit[1];
    decstr = replaceCharWith(decstr, 'd',':');
    decstr = replaceCharWith(decstr, 'm',':');
    decstr = replaceCharWith(decstr, 's','');
    csplit = [rastr,decstr];
    //console.log('hms dms converted to colon: '+rastr+' '+decstr);
  }

  // Handle case of XX? XX? XX? XX?  where HH MM DD MM and ? are h m d or unicode characters for the same
  if (nTok == 4 && nColon == 0 && nDec == 0) {
    //# Remove extraneuous characters from tokens. Keep only numbers and decimal point
    for (let i = 0; i < nTok; i++) {
        csplit[i] = csplit[i].replace(/[^\d.-]/g, '');
    }
    nTok = 2;
    nColon = 1;
    csplit[0] = `${zeroPad(parseInt(csplit[0]),2)}:${zeroPad(parseInt(csplit[1]),2)}:`;
    csplit[1] = `${zeroPad(parseInt(csplit[2]),2)}:${zeroPad(parseInt(csplit[3]),2)}:`;
    //console.log('hh mm dd mm convert to colon: ', csplit[0],' ', csplit[1]);
  }
  // Handle case of XX XX XX.XX XX XX XX.XX where HH MM SS.s DD MM SS.s you can also have identifiers such as h m s d
  if (nTok == 6 && nColon == 0 && nDec >= 0 && nDec <= 2) {
    // Remove extraneuous characters from tokens. Keep only numbers and decimal point
    for (let i = 0; i < nTok; i++) {
        csplit[i] = csplit[i].replace(/[^\d.-]/g, '');
    }
    nTok = 2;
    nColon = 1;
    csplit[0] = `${zeroPad(parseInt(csplit[0]),2)}:${zeroPad(parseInt(csplit[1]),2)}:${zeroPad(parseFloat(csplit[2]).toFixed(3),2)}`;
    csplit[1] = `${zeroPad(parseInt(csplit[3]),2)}:${zeroPad(parseInt(csplit[4]),2)}:${zeroPad(parseFloat(csplit[5]).toFixed(3),2)}`;
    //console.log('hh mm ss.s dd mm ss.s convert to colon: ', csplit[0],' ', csplit[1]);
  }

  // Here is colon case that does most of the conversions and validation of input
  //  only allow hms form for ra and dms for dec
  if (nTok == 2 && nColon >= 1) {
    //# handle RA
    var rasplit = csplit[0].split(':');
    var nra = rasplit.length;
    var rah = 0.0;
    var ram = 0.0;
    var ras = 0.0;
    if (rasplit[0]) {
      rah = parseFloat(rasplit[0]);
    }
    if (nra >= 2) { // single colon ra hour and minutes given
      if (rasplit[1]) {
        ram = parseFloat(rasplit[1]);
      }
    }
    if (nra == 3) { // 2 colons ra hr, min, sec given
      if (rasplit[2]) {
        ras = truncate(parseFloat(rasplit[2]),3);
      }
    }
    // handle declination
    var desplit = csplit[1].split(':');
    var nde = desplit.length;
    var ded = 0.0;
    var dem = 0.0;
    var des = 0.0;
    if (desplit[0]) {
      ded = parseFloat(desplit[0]); //  dec in degrees given
    }
    if (nde >= 2) { // single colon dec deg and minutes given
      if (desplit[1]) {
        dem = parseFloat(desplit[1]);
      }
    }
    if (nde == 3) { // 2 colons dec deg, min, sec given
      if (desplit[2]) {
        des = truncate(parseFloat(desplit[2]),3);
      }
    }
    // validate nra and nde
    if (nra >= 1 && nra <= 3 && nde >= 1 && nde <= 3) {
      // validate rah, ram, and ras
      if (rah >= 0.0 && rah < 24.0 && ram >= 0.0 && ram < 60.0 && ras >= 0.0 && ras < 60.0) {
        // validate ded, dem, des
        if (ded >= -90.0 && ded <= 90.0 && dem >= 0.0 && dem < 60.0 && des >= 0.0 && des < 60.0) {
          radeg = rah*hr2deg + ram*hrm2deg + ras*hrs2deg;
          if (ded >= 0.0) {
            decdeg = ded + dem*m2deg + des*s2deg;
          } else {
            decdeg = ded - dem*m2deg - des*s2deg;
          }
          // validate radeg and decdeg
          if (radeg >= 0.0 && radeg < 360.0 && decdeg >= -90.0 && decdeg <= 90.0) {
            accept = true;
          } else {
            errorStr += `Unexpected validation error for ${cstr} ra [deg] ${radeg} dec [deg] ${decdeg}`;
          }
        } else {
          errorStr += `Invalid range of declination deg: ${ded} [-90 - 90 deg] or minutes: ${dem} [0-60 min) or seconds: ${des} [0-60sec)`;
        }
      } else {
        errorStr += `Invalid range of ra hour: ${rah} [0-24 hr) or minutes: ${ram} [0-60 min) or seconds ${ras} [0-60sec)`;
      }
    } else {
      errorStr += `Too many colons encountered in requested ra or dec ${cst}`;
    }
  }

  // Check to see if there was no accepted conversion and no error
  // This implies unhandled case. Give warning in errorStr
  if (!accept && errorStr === '') {
    errorStr += `Could not find handler for input ${cstr}`;
  }

  return [radeg, decdeg, accept, errorStr];
}
// rdp Testing
//rdp('25.0d 36.0d');
//rdp('25.0d+36.0d');
//rdp('25.0d-36.0d');
//var rdpOut = rdp('25.0 36.0');
//var rdpOut = rdp(' 84d17m28.275s -80d28m08.831s');
//var rdpOut = rdp('05h37m09.885s -80d28m08.831s');
//var rdpOut = rdp('05h 37m -80d 28m');
//var rdpOut = rdp('05h 37m 09.885s -80d 28m 08.831s');
//var rdpOut = rdp('05 37 09.885 -80 28 08.831');
//var rdpOut = rdp('05h 37m 09.8851s −80° 28′ 08.8313″');
//console.log(rdpOut[0]);
//console.log(rdpOut[1]);
//console.log(rdpOut[2]);
//console.log(rdpOut[3]);
