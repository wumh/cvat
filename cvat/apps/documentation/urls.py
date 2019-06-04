
# Copyright (C) 2018 Intel Corporation
#
# SPDX-License-Identifier: MIT

from django.urls import path,re_path
from . import views

urlpatterns = [
    path('user_guide.html', views.UserGuideView),
    path('xml_format.html', views.XmlFormatView),
    re_path('explain/(\S+).html',views.Explain),
]

