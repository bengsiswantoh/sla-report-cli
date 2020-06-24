import sys
import rrdtool

result = rrdtool.fetch('test.rrd',
                       'AVERAGE',
                       '--start', '920804400',
                       '--end', '920809200')

startStop, names, values = result
start, end, step = startStop
values = [v[0] for v in values]

print(startStop)
print(names)
print(values)
