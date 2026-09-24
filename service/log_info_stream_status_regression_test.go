package service

import (
	"testing"

	"github.com/QuantumNous/new-api/model"
	relaycommon "github.com/QuantumNous/new-api/relay/common"
	"github.com/stretchr/testify/assert"
)

func TestAppendStreamStatus_ClientGoneAfterCompletionIsNotError(t *testing.T) {
	cases := []struct {
		name   string
		build  func() *relaycommon.StreamStatus
		status string
	}{
		{
			name: "terminal event then client close (the reported false alarm)",
			build: func() *relaycommon.StreamStatus {
				s := relaycommon.NewStreamStatus()
				s.MarkCompleted()
				s.SetEndReason(relaycommon.StreamEndReasonClientGone, nil)
				return s
			},
			status: "ok",
		},
		{
			name: "client aborts mid-stream",
			build: func() *relaycommon.StreamStatus {
				s := relaycommon.NewStreamStatus()
				s.SetEndReason(relaycommon.StreamEndReasonClientGone, nil)
				return s
			},
			status: "error",
		},
		{
			name: "protocol failure",
			build: func() *relaycommon.StreamStatus {
				s := relaycommon.NewStreamStatus()
				s.MarkFailed("server_error", "upstream", 502)
				s.SetEndReason(relaycommon.StreamEndReasonEOF, nil)
				return s
			},
			status: "error",
		},
		{
			name: "timeout with no completion",
			build: func() *relaycommon.StreamStatus {
				s := relaycommon.NewStreamStatus()
				s.SetEndReason(relaycommon.StreamEndReasonTimeout, nil)
				return s
			},
			status: "error",
		},
		{
			name: "normal done",
			build: func() *relaycommon.StreamStatus {
				s := relaycommon.NewStreamStatus()
				s.MarkCompleted()
				s.SetEndReason(relaycommon.StreamEndReasonDone, nil)
				return s
			},
			status: "ok",
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			info := &relaycommon.RelayInfo{IsStream: true, StreamStatus: tc.build()}
			other := model.NewLogOther()
			appendStreamStatus(info, other)
			got, ok := other.Snapshot()["stream_status"].(map[string]any)
			assert.True(t, ok, "stream_status missing")
			assert.Equal(t, tc.status, got["status"], "end_reason=%v", got["end_reason"])
		})
	}
}

func TestAppendStreamStatus_SoftErrorStillWinsOverCompletion(t *testing.T) {
	s := relaycommon.NewStreamStatus()
	s.MarkCompleted()
	s.RecordError("upstream chunk decode failed")
	s.SetEndReason(relaycommon.StreamEndReasonClientGone, nil)

	info := &relaycommon.RelayInfo{IsStream: true, StreamStatus: s}
	other := model.NewLogOther()
	appendStreamStatus(info, other)
	got := other.Snapshot()["stream_status"].(map[string]any)
	assert.Equal(t, "error", got["status"], "a soft error must still surface as an error")
}
