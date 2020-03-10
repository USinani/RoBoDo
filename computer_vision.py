import numpy as np 
import cv2 as cv
import matplotlib.pyplot as plt
import matplotlib.image as mpimg

image = cv.imread('image.jpg')

# cv.imshow('ímage', image)

# Edge detector
# apply Canny()
gray_scale = cv.cvtColor(image, cv.COLOR_BGR2GRAY)
kernel_size = (3,3)
gaussian_blur = cv.GaussianBlur( src = gray_scale, ksize = kernel_size, sigmaX = 0 )
thresh1, thresh2 = 255, 255
canny_edges = cv.Canny( gaussian_blur, thresh1, thresh2 )

# apply threshold()
# example: ret,thresh1 = cv.threshold(img,127,255,cv.THRESH_BINARY)
thresh = 130
maxval = 255
thresh_type = cv.THRESH_BINARY
ret, threshold = cv.threshold(image, thresh, maxval, thresh_type)

# apply adaptiveThreshold()
# example: 
max_val = 255
adaptive_method = cv.ADAPTIVE_THRESH_GAUSSIAN_C
thresh_type = cv.THRESH_BINARY

# Size of a pixel neighborhood that is used to calculate a threshold value for the pixel: 3, 5, 7, and so on
# apply adaptiveThreshold()
block_size = 3
adaptive_threshold = cv.adaptiveThreshold(gray_scale, max_val, adaptive_method, thresh_type, block_size, -1)

# range = cv.inRange()

# Apply findContours()
contours, hierarchy = cv.findContours(adaptive_threshold, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE)
# print(contours)
# Apply drawContours()
# cnt = [contours]
contour_idx = -1
color = (255, 0, 0)
draw_contours = cv.drawContours(image, hierarchy, contour_idx, color )


# plt.imshow(threshold)
cv.imshow('contours', draw_contours)

cv.waitKey(0)
cv.destroyAllWindows()