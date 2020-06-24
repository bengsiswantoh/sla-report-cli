import sys
import rrdtool

# in real life data_sources would be populated in loop or something similar
data_sources = ['DS:speed:COUNTER:600:U:U']

rrdtool.create('test.rrd',
               '--start', '920804400',
               data_sources,
               'RRA:AVERAGE:0.5:1:24',
               'RRA:AVERAGE:0.5:6:10')

data_sources = ['920804700:12345', '920805000:12357', '920805300:12363',
                '920805600:12363', '920805900:12363', '920806200:12373',
                '920806500:12383', '920806800:12393', '920807100:12399',
                '920807400:12405', '920807700:12411', '920808000:12415',
                '920808300:12420', '920808600:12422', '920808900:12423']

rrdtool.update('test.rrd', data_sources)
