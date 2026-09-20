package setting

import (
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/QuantumNous/new-api/common"
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

// 两个用户侧接口把这个值直接放进信封，前端按「字符串数组」声明类型；未配置时返回
// nil 会序列化成 null，与声明不符，也会让将来的调用方踩空。
func TestGetGroupOrderNeverReturnsNil(t *testing.T) {
	original := GroupOrder2JSONString()
	t.Cleanup(func() {
		require.NoError(t, UpdateGroupOrderByJSONString(original))
	})

	for _, stored := range []string{`null`, `[]`} {
		require.NoError(t, UpdateGroupOrderByJSONString(stored))
		order := GetGroupOrder()
		assert.NotNil(t, order, "存的是 %s 时不能返回 nil", stored)
		assert.Empty(t, order)
	}
}

// withGroupRatioOption 临时改写 common.OptionMap["GroupRatio"]，并在用例结束后还原，
// 免得污染同包里的其它用例（这一层是全局状态）。
func withGroupRatioOption(t *testing.T, value string) {
	t.Helper()

	common.OptionMapRWMutex.Lock()
	previous, had := common.OptionMap["GroupRatio"]
	if common.OptionMap == nil {
		common.OptionMap = map[string]string{}
	}
	common.OptionMap["GroupRatio"] = value
	common.OptionMapRWMutex.Unlock()

	t.Cleanup(func() {
		common.OptionMapRWMutex.Lock()
		defer common.OptionMapRWMutex.Unlock()
		if had {
			common.OptionMap["GroupRatio"] = previous
			return
		}
		delete(common.OptionMap, "GroupRatio")
	})
}

// 后台表格的行序就是 GroupRatio 的书写顺序（保存时按行序写入）。从未保存过顺序时，
// 用户看到的顺序必须跟随后台表格，而不是 encoding/json 给 map 排出来的字母序——
// 否则后台调完顺序，用户那边毫无变化，直到管理员碰巧又按了一次保存。
func TestGetGroupOrderFallsBackToGroupRatioRowOrder(t *testing.T) {
	original := GroupOrder2JSONString()
	t.Cleanup(func() {
		require.NoError(t, UpdateGroupOrderByJSONString(original))
	})
	require.NoError(t, UpdateGroupOrderByJSONString(`[]`))

	// 键的书写顺序刻意不是字母序，也不含 auto。
	withGroupRatioOption(t, `{"福利分组":0.15,"Zeta分组":1,"Alpha分组":0.5}`)

	assert.Equal(t,
		[]string{"福利分组", "Zeta分组", "Alpha分组"},
		GetGroupOrder(),
	)
}

// 保存过的顺序优先于回落的表格顺序。
func TestGetGroupOrderPrefersTheSavedOrderOverTheTableOrder(t *testing.T) {
	original := GroupOrder2JSONString()
	t.Cleanup(func() {
		require.NoError(t, UpdateGroupOrderByJSONString(original))
	})

	withGroupRatioOption(t, `{"甲":1,"乙":1}`)
	require.NoError(t, UpdateGroupOrderByJSONString(`["乙","甲"]`))

	assert.Equal(t, []string{"乙", "甲"}, GetGroupOrder())
}

// 回落源不可用时（没这个 option、不是对象、写坏了）必须是空数组而不是 nil，
// 否则又会回到 null 那个问题上。
func TestGetGroupOrderFallbackIsEmptyWhenGroupRatioIsUnusable(t *testing.T) {
	original := GroupOrder2JSONString()
	t.Cleanup(func() {
		require.NoError(t, UpdateGroupOrderByJSONString(original))
	})
	require.NoError(t, UpdateGroupOrderByJSONString(`[]`))

	for _, unusable := range []string{"", "null", `["not","an","object"]`, `{"a":`} {
		withGroupRatioOption(t, unusable)
		order := GetGroupOrder()
		assert.NotNil(t, order, "GroupRatio 是 %q 时不能返回 nil", unusable)
		if unusable == `{"a":` {
			// 半截 JSON：读到哪算哪，"a" 是有效的部分结果。
			assert.Equal(t, []string{"a"}, order)
			continue
		}
		assert.Empty(t, order, "GroupRatio 是 %q 时应回落到空顺序", unusable)
	}
}
