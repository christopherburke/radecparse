# radecparse
Parse various right ascension and declination celestial coordinate formats into decimal format and inverse.
Don't you hate having to convert `05h37m09.885s -80d28m08.831s` into decimal `84.2911875 -80.46911972` or from decimal into hms dms formats. Well, now you can use this ra and dec coordinate string parser into decimal radecparse.rdp(<coordinate string>). Also has radecparse.degconvert(<float ra [deg]>, float dec[deg]>) to write out strings in HH:MM:SS.s +/-DD:MM:SS.s or HHhMMmSS.ss +/- DDdMMmSS.ss or HH MM SS.s +/-DD MM SS.s
 or RA decimal formats.

Note that you can accomplish all this with the astropy SkyCoord class, but you have to deal with units and import astropy, etc. This is a standalone tool to accomplish this coordinate conversion.
 
 There is a python version and javascript version. I am working on getting the javascript working on my personal webpages.
