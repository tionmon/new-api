package setting

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/QuantumNous/new-api/common"
)

// withGroupRatioOption 临时改写 common.OptionMap["GroupRatio"]——分组展示顺序的唯一来源——
// 并在用例结束后还原，免得污染同包里的其它用例（这一层是全局状态）。
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

func TestSortGroupsByDisplayOrder(t *testing.T) {
	tests := []struct {
		name       string
		orderJSON  string
		groupNames []string
		want       []string
	}{
		{
			name:       "configured order wins",
			orderJSON:  `{"b":1,"a":1,"c":1}`,
			groupNames: []string{"a", "b", "c"},
			want:       []string{"b", "a", "c"},
		},
		{
			name:       "names missing from the order keep their relative order at the end",
			orderJSON:  `{"c":1,"a":1}`,
			groupNames: []string{"a", "b", "d", "c"},
			want:       []string{"c", "a", "b", "d"},
		},
		{
			name:       "empty order leaves the input untouched",
			orderJSON:  `{}`,
			groupNames: []string{"a", "b"},
			want:       []string{"a", "b"},
		},
		{
			name:       "order entries that no longer exist are ignored",
			orderJSON:  `{"gone":1,"b":1,"a":1}`,
			groupNames: []string{"a", "b"},
			want:       []string{"b", "a"},
		},
		{
			// 与 web/src/lib/group-order.test.ts 的重复项用例一一对应：重复项是最容易把
			// 「未列出者排到末尾」算错的地方——名次若取「去重后的条数」而不是「原数组
			// 长度」，未列出的分组就不再排在它们后面。
			name:       "a repeated order entry keeps its first position only",
			orderJSON:  `{"a":1,"a":2,"b":1}`,
			groupNames: []string{"b", "a"},
			want:       []string{"a", "b"},
		},
		{
			name:       "unmentioned names still come last when the order repeats an entry",
			orderJSON:  `{"x":1,"x":2,"b":1}`,
			groupNames: []string{"z", "b"},
			want:       []string{"b", "z"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			withGroupRatioOption(t, tt.orderJSON)
			assert.Equal(t, tt.want, SortGroupsByDisplayOrder(tt.groupNames))
		})
	}
}

// 分组展示顺序的唯一来源是 GroupRatio 的书写顺序（保存时按行序写入）。用 encoding/json
// 给 map 排出来的字母序是错的——那正是线上「后台调完顺序、用户那边毫无变化」的成因。
func TestGetGroupOrderReadsTheRowOrderFromGroupRatio(t *testing.T) {
	// 键的书写顺序刻意不是字母序，也不含 auto。
	withGroupRatioOption(t, `{"福利分组":0.15,"Zeta分组":1,"Alpha分组":0.5}`)

	assert.Equal(t,
		[]string{"福利分组", "Zeta分组", "Alpha分组"},
		GetGroupOrder(),
	)
}

// 来源不可用时（没这个 option、不是对象、写坏了）必须是空数组而不是 nil：
// 两个用户侧接口把它直接放进信封，前端按「字符串数组」声明类型。
func TestGetGroupOrderIsEmptyWhenGroupRatioIsUnusable(t *testing.T) {
	for _, unusable := range []string{"", "null", `["not","an","object"]`, `{"a":`} {
		t.Run(unusable, func(t *testing.T) {
			withGroupRatioOption(t, unusable)
			order := GetGroupOrder()
			assert.NotNil(t, order, "GroupRatio 是 %q 时不能返回 nil", unusable)
			if unusable == `{"a":` {
				// 半截 JSON：读到哪算哪，"a" 是有效的部分结果。
				assert.Equal(t, []string{"a"}, order)
				return
			}
			assert.Empty(t, order, "GroupRatio 是 %q 时应回落到空顺序", unusable)
		})
	}
}

func TestGetGroupOrderIsEmptyWithoutTheOption(t *testing.T) {
	common.OptionMapRWMutex.Lock()
	previous, had := common.OptionMap["GroupRatio"]
	delete(common.OptionMap, "GroupRatio")
	common.OptionMapRWMutex.Unlock()
	t.Cleanup(func() {
		if !had {
			return
		}
		common.OptionMapRWMutex.Lock()
		defer common.OptionMapRWMutex.Unlock()
		common.OptionMap["GroupRatio"] = previous
	})

	order := GetGroupOrder()
	require.NotNil(t, order)
	assert.Empty(t, order)
}
