#!/usr/bin/python3

import os
import sys
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__) + '/' + '..'))

from ffmap.mysqltools import FreifunkMySQL

import urllib.request, urllib.error, json

def update_hoods_v2(mysql):
	try:
		with urllib.request.urlopen("http://keyserver.freifunk-franken.de/v2/hoods.php") as url:
			hoodskx = json.loads(url.read().decode())
		
		kx_keys = []
		kx_data = []
		for kx in hoodskx:
			kx_keys.append(kx["id"])
			kx_data.append((kx["id"],kx["name"],kx["net"],kx.get("lat",None),kx.get("lon",None),))

		# Delete entries in DB where hood is missing in KeyXchange
		db_keys = mysql.fetchall("SELECT id FROM hoodsv2",(),"id")
		for n in db_keys:
			if n in kx_keys:
				continue
			mysql.execute("DELETE FROM hoodsv2 WHERE id = %s",(n,))

		# Create/update entries from KeyXchange to DB
		mysql.executemany("""
			INSERT INTO hoodsv2 (id, name, net, lat, lng)
			VALUES (%s, %s, %s, %s, %s)
			ON DUPLICATE KEY UPDATE
				name=VALUES(name),
				net=VALUES(net),
				lat=VALUES(lat),
				lng=VALUES(lng)
		""",kx_data)

	except urllib.error.HTTPError as e:
		return
