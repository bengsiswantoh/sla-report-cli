import sys
import rrdtool

filename = 'test.rrd'

result = rrdtool.fetch(filename,
                       'AVERAGE',
                       '--start', '920804400',
                       '--end', '920809200')

startStop, names, values = result
start, end, step = startStop
values = [v[0] for v in values]

print(startStop)
print(names)
print(values)
