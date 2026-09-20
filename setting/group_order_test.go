package setting

import (
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestSortGroupsByDisplayOrder(t *testing.T) {
	original := GroupOrder2JSONString()
	t.Cleanup(func() {
		require.NoError(t, UpdateGroupOrderByJSONString(original))
	})

	tests := []struct {
		name       string
		orderJSON  string
		groupNames []string
		want       []string
	}{
		{
			name:       "configured order wins",
			orderJSON:  `["b","a","c"]`,
			groupNames: []string{"a", "b", "c"},
			want:       []string{"b", "a", "c"},
		},
		{
			name:       "names missing from the order keep their relative order at the end",
			orderJSON:  `["c","a"]`,
			groupNames: []string{"a", "b", "d", "c"},
			want:       []string{"c", "a", "b", "d"},
		},
		{
			name:       "empty order leaves the input untouched",
			orderJSON:  `[]`,
			groupNames: []string{"a", "b"},
			want:       []string{"a", "b"},
		},
		{
			name:       "order entries that no longer exist are ignored",
			orderJSON:  `["gone","b","a"]`,
			groupNames: []string{"a", "b"},
			want:       []string{"b", "a"},
		},
		{
			name:       "duplicate order entries do not duplicate names",
			orderJSON:  `["a","a","b"]`,
			groupNames: []string{"b", "a"},
			want:       []string{"a", "b"},
		},
		{
			name:       "duplicate order entries still leave unmentioned names last",
			orderJSON:  `["x","x","b"]`,
			groupNames: []string{"z", "b"},
			want:       []string{"b", "z"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			require.NoError(t, UpdateGroupOrderByJSONString(tt.orderJSON))
			assert.Equal(t, tt.want, SortGroupsByDisplayOrder(tt.groupNames))
		})
	}
}

// 前端把该字段当「JSON 字符串数组」校验，null 会被判非法，于是管理员点保存会被
// 静默拦下、功能永远激活不了。从未配置过时 groupOrder 是 nil，这是线上首次部署
// 的真实形态（options 表里还没有 GroupOrder 行）。
func TestGroupOrder2JSONStringAlwaysEmitsJSONArray(t *testing.T) {
	original := GroupOrder2JSONString()
	t.Cleanup(func() {
		require.NoError(t, UpdateGroupOrderByJSONString(original))
	})

	for _, stored := range []string{`null`, `[]`, `["b","a"]`} {
		require.NoError(t, UpdateGroupOrderByJSONString(stored))
		assert.True(t, strings.HasPrefix(GroupOrder2JSONString(), "["),
			"存的是 %s 时，序列化结果必须是 JSON 数组", stored)
	}
}
