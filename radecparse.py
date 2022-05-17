#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Fri May 13 15:58:10 2022

@author: cjburke
"""

import argparse
from collections import Counter
import math

def protectint(x, tiny=1.0e-8):
    # Perform a floor int unless within tiny of next larger int, then round up
    if 1.0 - (x % 1.0) < tiny:
        return int(x+tiny)
    else:
        return int(x)

def protectzero(x, tiny=1.0e-8):
    # if x is with tiny of zero force it to zero
    if abs(x) < tiny:
        return 0.0
    else:
        return x

def truncate(f, n):
    return math.floor(f * 10 ** n) / 10 ** n

def degconvert(ra,dec):
    # Assumes ra and dec are given as float values in degrees convert to 
    # several coordinate output formats
    deg2hr = 24.0/360.0
    colonform = ''
    hmsform = ''
    spaceform = ''
    dmsform = ''
    hdform = ''
    validInputs = False
    validRa = False
    validDec = False
    # Validate inputs
    if isinstance(ra, float) and ra>=0.0 and ra<360.0:
        validRa = True
    else:
        print('Invalid RA input {0}. RA must be a float scalar with range 0<=Ra<360.0'.format(ra))
    if isinstance(dec, float) and dec>=-90.0 and dec<=90.0:
        validDec = True
    else:
        print('Invalid Dec input {0}. Dec must be a float scalar with range -90<=Dec<=90'.format(dec))
 
    if validRa and validDec:
        validInputs = True
        
    # Validated inputs calculate various forms
    if validInputs:
        # Do RA deg to dms
        radint = protectint(ra)
        ram = (ra - radint)*60.0
        ramint = protectint(ram)
        ras = ra - radint - ramint/60.0
        ras = protectzero(ras*3600.0)
        # Do RA deg to hms
        rahdecimal = ra*deg2hr
        rahint = protectint(rahdecimal)
        ram2 = (rahdecimal - rahint)*60.0
        ramint2 = protectint(ram2)
        ras2 = rahdecimal - rahint - ramint2/60.0
        ras2 = protectzero(ras2*3600.0)
        # Do Dec deg to dms
        sign = 1
        origdec = dec
        if dec < 0.0:
            sign = -1
            dec = abs(dec)
        decdint = protectint(dec)
        decm = (dec - decdint)*60.0
        decmint = protectint(decm)
        decs = dec - decdint - decmint/60.0
        decs = protectzero(decs*3600.0)
        decdint = decdint * sign
        colonform = '{0:02d}:{1:02d}:{2:06.3f} {3:+02d}:{4:02d}:{5:06.3f}'.format(rahint,\
                     ramint2, ras2, decdint, decmint, decs)
        hmsform = '{0:02d}h{1:02d}m{2:06.3f}s {3:+02d}d{4:02d}m{5:06.3f}s'.format(rahint,\
                     ramint2, ras2, decdint, decmint, decs)
        spaceform = '{0:02d} {1:02d} {2:05.3f} {3:+02d} {4:02d} {5:06.3f} '.format(rahint,\
                     ramint2, ras2, decdint, decmint, decs)
        dmsform = '{0:02d}d{1:02d}m{2:06.3f}s {3:+02d}d{4:02d}m{5:06.3f}s'.format(radint,\
                     ramint, ras, decdint, decmint, decs)
        hdform = '{0:11.8f}h {1:+12.8f}d'.format(rahdecimal, origdec)
    return colonform,hmsform,spaceform,dmsform,hdform

def rdp(cstr):
    # cstr The argument as a single string
    # convert string into a list with each white space separated token
    # as an entry
    csplit = cstr.split()
    # count tokens in argument
    nTok = len(csplit)
    # Make a version with all white space removed
    fullstr = ''.join(csplit)
    # Make a 'histogram' of characters in the string
    # with the collections Counter routine
    charhist = Counter(fullstr)
    # number of decimal points in string
    nDec = charhist['.']
    # number of : in string
    nColon = charhist[':']
    # number of h
    nh = charhist['h']
    # number of m
    nm = charhist['m']
    # number of s
    ns = charhist['s']
    # number of d
    nd = charhist['d']
    # number of +
    nplus = charhist['+']
    # number of -
    nneg = charhist['-']

    # default output for ra and dec [deg]
    radeg = 0.0
    decdeg = 0.0
    # constants
    hr2deg = 360.0/24.0
    hrm2deg = hr2deg/60.0
    hrs2deg = hrm2deg/60.0
    m2deg = 1.0/60.0
    s2deg = m2deg/60.0
    deg2hr = 24.0/360.0

    
    # Overall acceptance/validated flag
    accept = False
    # First if there is a single token only accept if there is a + or - 
    # to separate ra from dec
    if nTok == 1 and (nplus == 1 or nneg == 1):
        # split token on plus or negative and reset the main storage
        if nplus == 1:
            sidx = cstr.index('+')
        else:
            sidx = cstr.index('-')
        csplit = [cstr[0:sidx], cstr[sidx:-1]]
        nTok = 2
        #print(csplit)
    
    # Handle case of decimal format with d at end of each ra and dec
    # 25.0d 36.0d
    if nTok == 2 and (nDec >=0 and nDec<=2) and nColon == 0 and nh == 0 and nm == 0 and ns == 0 and nd == 2:
        rastr = csplit[0]
        idx = rastr.find('d')
        if idx >=0:
            rastr = rastr[:idx]
        decstr = csplit[1]
        idx = decstr.find('d')
        if idx >=0:
            decstr = decstr[:idx]
        csplit = [rastr, decstr]
        nd = 0
    
    # Handle case of decimal format
    # case 25 36 or or 25 36.0 or 25.0 36 or 25.0 36.0 - two integers with no decimals or 2 decimals
    # treat as degrees for ra and dec
    if nTok == 2 and (nDec >= 0 and nDec <= 2) and nColon == 0 and nh == 0 and nm == 0 and ns == 0 and nd == 0:
        # validate ra dec range
        ra = float(csplit[0])
        dec = float(csplit[1])
        if ra >= 0.0 and ra <= 360.0 and dec >= -90.0 and dec <= 90.0:
            accept = True
            radeg = ra
            decdeg = dec
        else:
            print('Invalid range of ra {0:f} [0-360 deg] or dec {1:f} [-90 - 90 deg]'.format(ra, dec))

    # Handle case of dms for ra string
    # by converting ra dms string to ra hms string then handling later
    if nTok == 2 and csplit[0].count('d') == 1 and nColon == 0:
        rastr = csplit[0]
        ra = 0.0
        radsplit = rastr.split('d')
        rad = float(radsplit[0])
        if radsplit[1].count('m') == 1:
            ramsplit = radsplit[1].split('m')
            rad = rad + float(ramsplit[0])/60.0
            if ramsplit[1].count('s') == 1:
                rassplit = ramsplit[1].split('s')
                rad = rad + float(rassplit[0])/3600.0
        rah = rad * deg2hr
        rahint = protectint(rah)
        ram = rah - rahint
        ramint = protectint(ram*60.0)
        ras = ram - ramint/60.0
        ras = truncate(protectzero(ras * 3600.0),3)
        csplit[0] = '{0:02d}h{1:02d}m{2:06.3f}s'.format(rahint,ramint,ras)
        nd = nd - 1
        nh = 1
            

    # Handle case of hms and dms
    # This will be handled by replacing hms dms with colons and handling
    #  later with the colon case
    if nTok == 2 and nColon == 0 and (nh > 0 or nm > 0 or ns > 0) and nd == 1:
        nColon = 1
        rastr = csplit[0]
        idx = rastr.find('h')
        if idx >=0:
            rastr = rastr[:idx] + ':' + rastr[idx+1:] 
        idx = rastr.find('m')
        if idx >=0:
            rastr = rastr[:idx] + ':' + rastr[idx+1:] 
        idx = rastr.find('s')
        if idx >=0:
            rastr = rastr[:idx] + rastr[idx+1:] 
        decstr = csplit[1]
        idx = decstr.find('d')
        if idx >=0:
            decstr = decstr[:idx] + ':' + decstr[idx+1:] 
        idx = decstr.find('m')
        if idx >=0:
            decstr = decstr[:idx] + ':' + decstr[idx+1:] 
        idx = decstr.find('s')
        if idx >=0:
            decstr = decstr[:idx] + decstr[idx+1:]
        csplit = [rastr,decstr]
    
    
    # Handle case of XX XX XX XX  where HH MM DD MM
    if nTok==4 and nColon==0 and nh==0 and nd==0 and nm==0 and ns==0:
        nTok = 2
        nColon = 1
        csplit = ['{0:02d}:{1:02d}:'.format(int(csplit[0]), int(csplit[1])),\
                  '{0:02d}:{1:02d}:'.format(int(csplit[2]), int(csplit[3]))]
    # Hand case of XX XX XX.XX XX XX XX.XX where HH MM SS.s DD MM SS.s
    if nTok == 6 and nColon==0 and nh==0 and nd==0 and nm==0 and ns==0:
        nTok = 2
        nColon = 1
        csplit = ['{0:02d}:{1:02d}:{2:06.3f}'.format(int(csplit[0]), int(csplit[1]), float(csplit[2])),\
                  '{0:02d}:{1:02d}:{2:06.3f}'.format(int(csplit[3]), int(csplit[4]), float(csplit[5]))]
        
        
    # Handle case with colons if there is any colon then
    #  only allow hms form for ra and dms for dec
    #  This also handles previous cases that were converted to this colon case and validates the inputs
    if nTok == 2 and nColon >= 1:
        # handle RA 
        rasplit = csplit[0].split(':')
        nra = len(rasplit)
        rah = 0.0
        if rasplit[0]:
            rah = float(rasplit[0]) # result will always at least have ra hour given
        ram = 0.0
        ras = 0.0            
        if nra >= 2: # single colon ra hour and minutes given
            if rasplit[1]:
                ram = float(rasplit[1])
        if nra == 3: # 2 colons ra hr, min, sec given
            if rasplit[2]:
                ras = truncate(float(rasplit[2]),3)
        # handle declination
        desplit = csplit[1].split(':')
        nde = len(desplit)
        ded = 0.0
        if desplit[0]:
            ded = float(desplit[0]) # dec in degrees given
        dem = 0.0
        des = 0.0
        if nde >= 2: # single colon dec deg and minutes given
            if desplit[1]:
                dem = float(desplit[1])
        if nde == 3: # 2 colons dec deg, min, sec given
            if desplit[2]:
                des = truncate(float(desplit[2]),3)
        # validate nra and nde
        if nra>=1 and nra<=3 and nde>=1 and nde<=3:
            # validate rah, ram, and ras
            if rah>=0.0 and rah<=24.0 and ram>=0.0 and ram<60.0 and ras>=0.0 and ras<60.0:
                # validate ded, dem, des
                if ded>=-90.0 and ded<=90.0 and dem>=0.0 and dem<60.0 and des>=0.0 and des<60.0:
                    radeg = rah*hr2deg + ram*hrm2deg + ras*hrs2deg
                    if ded >= 0.0:
                        decdeg = ded + dem*m2deg + des*s2deg
                    else:
                        decdeg = ded - dem*m2deg - des*s2deg
                    # validate radeg and decdeg
                    if radeg >=0.0 and radeg <=360.0 and decdeg>=-90.0 and decdeg<=90.0:
                        accept = True
                else:
                    print('Invalid range of declination deg {0:f} [-90 - 90 deg] or minutes {1:f} [0-60 min] or seconds {2:f} [0-60sec]'.format(ded, dem, des))
                    
            else:
                print('Invalid range of ra hour {0:f} [0-24 hr] or minutes {1:f} [0-60 min] or seconds {2:f} [0-60sec]'.format(rah, ram, ras))

        else:
            print('Too many colons encountered in requested ra or dec {0}'.format(cstr))                


    return accept, radeg, decdeg 

if __name__ == "__main__":
    parser = argparse.ArgumentParser(prefix_chars='@') # the prefix_chars
      # is a bug fix from 
      # https://stackoverflow.com/a/9031331/8543811
      # There is a problem with negative declination with colons in the
      #  declination string (i.e., -45:12:30) doesn't work without changing
      #  the prefix_chars
    parser.add_argument("coordstr", nargs='+', \
                        help="RA and Dec you want to convert to other formats ")

    args = parser.parse_args()
    # With argparse the white space separated token arguments
    #  come in as list with each token a separate entry in list
    #  convert this arg parse version back into a white space separated
    #  string like a user of the rdp function would pass.
    instr = ' '.join(args.coordstr)
    print('Parsing |{0}|'.format(instr))
    accept, radeg, decdeg = rdp(instr)
    if accept:
        print(radeg, decdeg)
        colonform,hmsform,spaceform,dmsform,hdform = degconvert(radeg, decdeg)
        print(colonform)
        print(hmsform)
        print(spaceform)
        print(dmsform)
        print(hdform)

    
