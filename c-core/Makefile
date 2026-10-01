# ==============================================================================
# Makefile - Hospital Bed Monitoring System (C Core Module)
#
# Academic Core Logic Engine for Data Validation, Filtering, Status Management,
# and Utilization Report Generation.
# ==============================================================================

CC = gcc
CFLAGS = -Wall -Wextra -std=c99 -pedantic -O2
TARGET = hospital_bed

# Source and Object files
SRCS = main.c bed.c validation.c filter.c report.c
OBJS = $(SRCS:.c=.o)
HEADERS = data.h bed.h validation.h filter.h report.h

# Windows executable detection
ifeq ($(OS),Windows_NT)
    TARGET := $(TARGET).exe
    RM = del /Q /F
else
    RM = rm -f
endif

.PHONY: all clean run

all: $(TARGET)

$(TARGET): $(OBJS)
	$(CC) $(CFLAGS) -o $@ $(OBJS)

%.o: %.c $(HEADERS)
	$(CC) $(CFLAGS) -c $< -o $@

run: $(TARGET)
	./$(TARGET)

clean:
	$(RM) $(OBJS) $(TARGET) bed_report.txt
