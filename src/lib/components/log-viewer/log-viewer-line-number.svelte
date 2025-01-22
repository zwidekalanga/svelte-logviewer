<script lang="ts">
	export let number: number;
	export let highlighted: boolean = false;
</script>

<a class="line-number" class:highlighted href={`#L${number}`} id={`L${number}`}>
	{number}
</a>

<style>
    .line-number {
        display: inline-block;
        width: 55px;
        margin-left: 15px;
        margin-right: 15px;
        color: #7e7e7e;
        -webkit-user-select: none;
        user-select: none;
        text-align: right;
        min-width: 40px;
        cursor: pointer;
        text-decoration: none;
        padding-right: 1em;
        vertical-align: top;
    }

    .highlighted {
        color: #ffffff;
    }
</style>
