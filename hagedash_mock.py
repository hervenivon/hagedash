#!/usr/bin/env python

import datetime
import json
import random
import sys
import time
from tornado import websocket, web, ioloop
from datetime import timedelta
from random import randint

class WebSocketHandler(websocket.WebSocketHandler):
    def __init__(self, application, request, **kwargs):
        super().__init__(application, request, **kwargs)
        self._pools_io_working_count = 1
        self._pools_gpu_working_count = 1

    def _getDataPoint(self):
        # create a new data point
        point_data = {
            "time": time.time(),
            "pools": {
                "io": {
                    "worker_count": random.randrange(1, 10),
                    "working_count": self._pools_io_working_count,
                    "type": "thread"
                },
                "gpu": {
                    "worker_count": random.randrange(1, 10),
                    "working_count": self._pools_gpu_working_count,
                    "type": "thread"
                }
            },
            "rasters": {
                "ortho16": {
                    "io_pool_id": "io",
                    "computation_pool_id": "io",
                    "merge_pool_id": "0120",
                    "resampling_pool_id": "0120",
                    "cached": False,
                    "fp": "Footprint(...)",
                    "fp_virtual": "Footprint(...)",
                    "dtype": "uint8",
                    "nodata": None,
                    "nbands": 3,
                    "proj4_stored": "proj4 stored",
                    "proj4_virtual": "virtual proj4"
                },
                "hm": {
                    "io_pool_id": "io",
                    "computation_pool_id": "gpu",
                    "merge_pool_id": "0120",
                    "resampling_pool_id": "0120",
                    "cached": True,
                    "cache_tiles_state": [
                        2,
                        5,
                        3
                    ]
                }
            },
            "connections": [
                [
                    "ortho16",
                    "hm"
                ],
                [
                    "dsm16",
                    "hm"
                ],
                [
                    "hm",
                    "null"
                ]
            ],
            "queries": {
                "0x25648": {
                    "connection": [
                        "ortho16",
                        "hm"
                    ],
                    "total_arrays": 16,
                    "sent_arrays": 15,
                    "max_waiting": 5,
                    "waiting": 1,
                    "total_pixels": 16000,
                    "sent_pixels": 15000,
                    "total_bytes": 16000,
                    "sent_bytes": 15000,
                    "total_area": 16,
                    "sent_area": 15
                },
                "0x87431": {
                    "connection": [
                        "dsm16",
                        "hm"
                    ],
                    "total_arrays": 1,
                    "sent_arrays": 0,
                    "max_waiting": 5,
                    "waiting": 0,
                    "total_pixels": 1000,
                    "sent_pixels": 0,
                    "total_bytes": 1000,
                    "sent_bytes": 0,
                    "total_area": 1,
                    "sent_area": 0
                },
                "0x8asd31": {
                    "connection": [
                        "hm",
                        None
                    ],
                    "total_arrays": 1,
                    "sent_arrays": 0,
                    "max_waiting": 5,
                    "waiting": 0,
                    "total_pixels": 500,
                    "sent_pixels": 0,
                    "total_bytes": 5000,
                    "sent_bytes": 0,
                    "total_area": 1,
                    "sent_area": 0
                }
            }
        }

        self._pools_io_working_count = random.randrange(0, 10)
        self._pools_gpu_working_count = random.randrange(0, 10)

        return point_data

    def check_origin(self, origin):
        return True

    # on open of this socket
    def open(self):
        print("Connection established.")
        # initiate data sending after 3 seconds
        ioloop.IOLoop.instance().add_timeout(
            datetime.timedelta(seconds=3), self.send_data)

    # close connection
    def on_close(self):
        print("\nConnection closed.")

    def send_data(self):
        """
          Our function that generates new (random) data for clients
        """

        try:
            # write the json object to the socket
            self.write_message(json.dumps(self._getDataPoint()))
            print('.', end='', flush=True)
        except websocket.WebSocketClosedError:
            pass

        # send new data every second
        ioloop.IOLoop.instance().add_timeout(
            datetime.timedelta(seconds=1), self.send_data)


if __name__ == "__main__":
    """
    create new web app w/ websocket endpoint available at /websocket
    """
    print("Starting websocket server program. Awaiting client requests to open websocket ...")

    app = web.Application([
        (r"/websocket", WebSocketHandler)
    ])
    app.listen(8001)
    ioloop.IOLoop.instance().start()
